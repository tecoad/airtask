import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bull';
import { CONSTANTS, StripeMetadataKind } from 'src/config/constants';
import { ENV } from 'src/config/env';
import {
	AccountUsageKind,
	CreateExtraCreditCheckoutInput,
	CurrencyCode,
} from 'src/graphql';
import { AccountsService } from 'src/modules/accounts/services/accounts.service';
import { EmailService } from 'src/modules/common/services/email.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { StripeService } from 'src/modules/common/services/stripe.service';
import { SystemNotificationsService } from 'src/modules/common/services/system-notifications.service';
import { FlowsService } from 'src/modules/flows/services/flows.service';
import Stripe from 'stripe';
import { getUsageCostByUsageKind } from '../helpers';
import { RESET_ACCOUNT_USAGE_JOB, USAGE_CONTROL_QUEUE } from '../jobs/constants';
import { UsageControlQueueData } from '../jobs/usage-control.queue';
import { StripeExtraCreditsCheckoutMetaData } from '../types';
import { CreditsManagerService } from './credits-manager.service';
import { SubscriptionManagerService } from './subscription-manager.service';

@Injectable()
export class UsageManagerService {
	constructor(
		private readonly prisma: PrismaService,
		@InjectQueue(USAGE_CONTROL_QUEUE)
		private readonly usageControlQueue: Queue<UsageControlQueueData>,
		private readonly stripe: StripeService,
		@Inject(forwardRef(() => SubscriptionManagerService))
		private readonly subscriptionManager: SubscriptionManagerService,
		private readonly emailService: EmailService,
		@Inject(forwardRef(() => FlowsService))
		private readonly flowsService: FlowsService,
		@Inject(forwardRef(() => CreditsManagerService))
		private readonly creditsManagerService: CreditsManagerService,
		@Inject(forwardRef(() => AccountsService))
		private readonly accountsService: AccountsService,
		private readonly systemNotificationsService: SystemNotificationsService,
	) {}

	async createExtraCreditCheckout(
		userId: number,
		{ accountId }: CreateExtraCreditCheckoutInput,
	) {
		const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

		const account = await this.prisma.account.findUniqueOrThrow({
			where: { id: Number(accountId) },
		});

		const currency = account.currency as CurrencyCode;

		if (!currency) {
			throw new Error('account-without-currency');
		}

		const metadatas = CONSTANTS.STRIPE.metadatas;
		let product: Stripe.Product | undefined = (
			await this.stripe.products.search({
				query: [
					[metadatas.kind, StripeMetadataKind.ExtraCredits],
					[metadatas.currency, currency],
				]
					.map(([key, value]) => `metadata["${key}"]:"${value}"`)
					.join(' AND '),
			})
		).data[0];
		let priceId: string | undefined =
			typeof product?.default_price === 'string'
				? product?.default_price
				: product?.default_price?.id;

		if (!product) {
			product = await this.stripe.products.create({
				name: `Extra Credits (${currency})`,
				metadata: {
					[metadatas.currency]: currency,
					[metadatas.kind]: StripeMetadataKind.ExtraCredits,
				},
			});

			const price = await this.stripe.prices.create({
				currency,
				product: product.id,
				custom_unit_amount: {
					enabled: true,
				},
			});

			priceId = price.id;

			product = await this.stripe.products.update(product.id, {
				default_price: priceId,
			});

			this.systemNotificationsService.finishStripeSetupOfExtraCreditProductForCurrency({
				currency,
				stripeProduct: product,
			});
		}

		const checkout = await this.stripe.checkout.sessions.create({
			success_url: `${ENV.REDIRECTS
				.redirect_after_subscription_checkout!}/{CHECKOUT_SESSION_ID}`,
			mode: 'payment',
			customer_email: user.email,
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			metadata: {
				accountId,
				kind: 'extra-credits-purchase',
			} as StripeExtraCreditsCheckoutMetaData,
		});
		return { url: checkout.url! };
	}

	async isAccountAllowedToPerformOperation(
		accountId: number,
		operationKind: AccountUsageKind,
		usages: number,
	): Promise<boolean> {
		const { plan, planPrice, subscription } =
			await this.accountsService.findSubscriptionPlan(accountId);

		if (
			!plan ||
			!planPrice ||
			!(await this.subscriptionManager.isSubscriptionActive(subscription)) ||
			!(plan.allowed_modules as AccountUsageKind[]).includes(operationKind)
		) {
			return false;
		}

		const { balance: accountBalance } =
			await this.creditsManagerService.totalBalanceForAccount(accountId);

		const costPerUsage = getUsageCostByUsageKind(operationKind, planPrice!);
		const totalCost = costPerUsage.times(usages);

		return accountBalance.gte(totalCost);
	}

	async createAccountUsageForOperation(
		accountId: number,
		operationKind: AccountUsageKind,
		usages: number,
	) {
		const { planPrice } = await this.accountsService.findSubscriptionPlan(accountId);

		const costPerUsage = getUsageCostByUsageKind(operationKind, planPrice!);
		const totalCost = costPerUsage.times(usages);

		await this.creditsManagerService.debitForAccount(accountId, totalCost);

		const { balance: totalBalanceAfterDebit } =
			await this.creditsManagerService.totalBalanceForAccount(accountId);

		if (totalBalanceAfterDebit.lte(0)) {
			await this.actionsOnAccountWithNegativeOrNonBalance(accountId);
		}

		return {
			totalCost,
			costPerUsage,
			totalBalanceAfterDebit,
		};
	}

	async actionsOnAccountWithNegativeOrNonBalance(accountId: number) {
		for (const module of Object.values(AccountUsageKind)) {
			switch (module) {
				// Do nothing, because on init setup of this module, it will check the balance,
				// and no actions ar eneed
				case AccountUsageKind.quotation:
					break;
				case AccountUsageKind.flow:
					await this.flowsService.stopAllAccountFlows(accountId);
					break;
			}
		}
	}

	async setAccountResetUsageDate(accountId: number, date: Date) {
		return this.prisma.account.update({
			where: {
				id: accountId,
			},
			data: {
				date_reset_usage: date,
			},
		});
	}

	@Cron(CronExpression.EVERY_DAY_AT_10PM)
	private async resetAccountsUsages() {
		const accounts = await this.prisma.account.findMany({
			where: {
				date_reset_usage: {
					lte: new Date(),
				},
			},
		});

		await this.usageControlQueue.addBulk(
			accounts.map((v) => ({
				data: {
					accountId: v.id,
				},
				opts: {
					// Add a job id to avoid duplicated jobs
					jobId: `${v.id}-${new Date().toLocaleDateString('pt-br')}`,
				},
				name: RESET_ACCOUNT_USAGE_JOB,
			})),
		);
	}
}
