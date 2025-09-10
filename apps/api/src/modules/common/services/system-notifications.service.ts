import { Injectable } from '@nestjs/common';
import { Prisma, account, subscription, subscription_plan } from '@prisma/client';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from 'discord.js';
import { ENV } from 'src/config/env';
import { CurrencyCode } from 'src/graphql';
import { DISCORD_MENTIONS } from 'src/modules/discord/helpers/mentions';
import { sanitizeName } from 'src/modules/users/utils/sanitize';
import { formatCurrency } from 'src/shared/utils/currency';
import { formatPrice } from 'src/shared/utils/price';
import { resolveEntityViewUrl } from 'src/shared/utils/resolve-asset-name';
import Stripe from 'stripe';
import { DiscordBotService } from '../../discord/services/discord-bot.service';
import { PrismaService } from './prisma.service';

function handleNotificationError(method) {
	if (isAsyncFunction(method)) {
		// Is async, wrap into a new async function
		return async function (...args) {
			try {
				const result = await method.apply(this, args);
				return result;
			} catch (e) {
				console.log(e);
			}
		};
	} else {
		// Isn't async, wrap into a new sync function
		return function (...args) {
			try {
				const result = method.apply(this, args);
				return result;
			} catch (e) {
				console.log(e);
			}
		};
	}
}

function isAsyncFunction(fn) {
	return fn.constructor && fn.constructor.name === 'AsyncFunction';
}

@Injectable()
export class SystemNotificationsService {
	unsafe: Omit<this, 'unsafe'> = {} as any;

	constructor(
		private readonly discord: DiscordBotService,
		private readonly prisma: PrismaService,
	) {
		// Each method will be wrapped at try/catch to prevent the execution
		// of the operations that use this class in case that Discord
		// is not available or something
		Object.getOwnPropertyNames(SystemNotificationsService.prototype).forEach(
			(methodName) => {
				const method = this[methodName];
				if (typeof method === 'function') {
					this.unsafe[methodName] = method.bind(this);
					this[methodName] = handleNotificationError(method);
				}
			},
		);
	}

	async newSubscription({
		account,
		subscription,
		subscriptionPlan,
		stripePriceId,
	}: {
		account: account;
		subscription: subscription;
		subscriptionPlan: subscription_plan;
		stripePriceId: string;
	}) {
		const channel = this.discord.channels.cache.get(
			this.discord.config.new_subscription_channel_id!,
		) as TextChannel;

		const subscriptionPlanPrice =
			await this.prisma.subscription_plan_price.findUniqueOrThrow({
				where: {
					external_id: stripePriceId,
				},
			});
		channel.send({
			embeds: [
				this.discord.defaultEmbed
					.setTitle('[Subscriptions] Nova assinatura registrada')
					.addFields(
						{
							name: 'Conta',
							value: `${account.name} (${account.segment})`,
						},
						{
							name: 'Status',
							value: sanitizeName(subscription.status!),
						},
						{
							name: 'Plano',
							value: `${subscriptionPlan.name} (${
								subscriptionPlanPrice.interval
							}) ${formatPrice({
								currencyCode: subscriptionPlanPrice.currency as CurrencyCode,
								value: Number(subscriptionPlanPrice.price),
							})})`,
						},
					),
			],
		});
	}

	async subscriptionTrialEndRenew({
		account,
		subscriptionPlan,
		stripePriceId,
	}: {
		account: account;
		subscriptionPlan: subscription_plan;
		stripePriceId: string;
	}) {
		const channel = this.discord.channels.cache.get(
			this.discord.config.subscription_trial_end_renew_channel_id!,
		) as TextChannel;

		const subscriptionPlanPrice =
			await this.prisma.subscription_plan_price.findUniqueOrThrow({
				where: {
					external_id: stripePriceId,
				},
			});

		channel.send({
			embeds: [
				this.discord.defaultEmbed
					.setTitle('[Subscriptions] Final de trial com renovação')
					.addFields(
						{
							name: 'Conta',
							value: `${account.name}`,
						},
						{
							name: 'Plano',
							value: `${subscriptionPlan.name} (${
								subscriptionPlanPrice.interval
							} ${formatPrice({
								currencyCode: subscriptionPlanPrice.currency as CurrencyCode,
								value: Number(subscriptionPlanPrice.price),
							})}) `,
						},
					),
			],
		});
	}

	dailyQuotationRequestsMetric({
		date,
		accountsInvolvedInRequests,
		quantityOfConversationsInitiated,
		quantityOfQuotationRequests,
	}: {
		date: Date;
		quantityOfQuotationRequests: number;
		quantityOfConversationsInitiated: number;
		accountsInvolvedInRequests: number;
	}) {
		const channel = this.discord.channels.cache.get(
			this.discord.config.subscription_trial_end_renew_channel_id!,
		) as TextChannel;

		channel.send({
			embeds: [
				this.discord.defaultEmbed
					.setTitle(`[Quotations] Métricas diárias ${date.toLocaleDateString('pt-br')}`)
					.addFields(
						{
							name: 'Total de conversas iniciadas',
							value: quantityOfConversationsInitiated.toString(),
						},
						{
							name: 'Conversas iniciadas que foram finalizadas',
							value: quantityOfQuotationRequests.toString(),
						},
						{
							name: 'Número de contas envolvidas nas conversas que foram finalizadas',
							value: accountsInvolvedInRequests.toString(),
						},
					),
			],
		});
	}

	/**
	 * Stripe Alerts
	 */
	finishStripeSetupOfExtraCreditProductForCurrency({
		currency,
		stripeProduct,
	}: {
		currency: CurrencyCode;
		stripeProduct: Stripe.Product;
	}) {
		const channel = this.discord.channels.cache.get(
			this.discord.config.finish_stripe_setup_of_extra_credits_alert!,
		) as TextChannel;

		channel.send({
			embeds: [
				this.discord.defaultEmbed
					.setTitle(`Atualização necessária de produto de extra crédito no Stripe`)
					.setDescription(
						`Uma nova currency foi utilizada para comprar extra créditos, e um produto foi criado com o título padrão de ${stripeProduct.name}. Ajuste à currency ${currency}.`,
					),
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setLabel('Abrir produto')
						.setStyle(ButtonStyle.Link)
						.setURL(ENV.STRIPE.entity_url('products', stripeProduct.id)),
				),
			],
			content: DISCORD_MENTIONS.role(this.discord.config.head_role!),
		});
	}

	/** Payment alerts */
	async extraCreditPurchase({
		accountId,
		value,
	}: {
		accountId: number;
		value: Prisma.Decimal;
	}) {
		const account = await this.prisma.account.findUniqueOrThrow({
			where: { id: accountId },
		});
		const channel = this.discord.channels.cache.get(
			this.discord.config.extra_credit_purchase_channel!,
		) as TextChannel;

		channel.send({
			embeds: [
				this.discord.defaultEmbed.setTitle(`Nova compra de créditos extra`).setFields(
					{
						name: 'Nome da conta',
						value: account.name!,
					},
					{
						name: 'Valor de créditos',
						value: formatCurrency(value.toNumber(), account.currency as CurrencyCode),
					},
				),
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setLabel('Abrir conta')
						.setStyle(ButtonStyle.Link)
						.setURL(resolveEntityViewUrl('account', account.id)),
				),
			],
		});
	}
}
