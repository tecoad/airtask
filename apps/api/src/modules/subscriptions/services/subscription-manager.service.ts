import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Prisma, subscription } from '@prisma/client';
import { ENV } from 'src/config/env';
import { CreateSubscriptionCheckoutInput, PlanInterval } from 'src/graphql';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { StripeService } from 'src/modules/common/services/stripe.service';
import { SystemNotificationsService } from 'src/modules/common/services/system-notifications.service';
import { TrackingService } from 'src/modules/common/services/tracking.service';
import { UserNotAAccountMemberError } from 'src/shared/errors';
import { ID, SubscriptionStatus } from 'src/shared/types/db';
import Stripe from 'stripe';
import { generateNextResetUsageDate } from '../helpers';
import { stripeStatusToSubscriptionStatus } from '../helpers/stripe-status-to-subscription';
import { StripeSubscriptionCheckoutMetadata, StripeSubscriptionMetaData } from '../types';
import { CreditsManagerService } from './credits-manager.service';
import { UsageManagerService } from './usage-manager.service';

export const allowedSubscriptionStatusToPerformOperation = [
	SubscriptionStatus.Active,
	SubscriptionStatus.Trialing,
	SubscriptionStatus.Pending,
];
@Injectable()
export class SubscriptionManagerService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly stripe: StripeService,
		private readonly systemNotificationsService: SystemNotificationsService,
		private readonly trackingService: TrackingService,
		@Inject(forwardRef(() => CreditsManagerService))
		private readonly creditsManagerService: CreditsManagerService,
		@Inject(forwardRef(() => UsageManagerService))
		private readonly usageManagerService: UsageManagerService,
	) {}

	async createSubscription(
		userId: number,
		{ priceExternalId, accountId }: CreateSubscriptionCheckoutInput,
	) {
		const user = await this.prisma.user.findUniqueOrThrow({
			where: { id: userId },
		});

		const checkout = await this.stripe.checkout.sessions.create({
			success_url: `${ENV.REDIRECTS.redirect_after_subscription_checkout}/{CHECKOUT_SESSION_ID}`,
			mode: 'subscription',
			customer_email: user.email,
			line_items: [
				{
					price: priceExternalId,
					quantity: 1,
				},
			],
			metadata: <StripeSubscriptionCheckoutMetadata>{
				kind: 'subscription-purchase',
			},
			payment_method_collection: 'if_required',
			subscription_data: {
				metadata: <StripeSubscriptionMetaData>{
					accountId,
				},
				...(ENV.PLANS.trial_days > 0
					? {
							trial_period_days: ENV.PLANS.trial_days,
							trial_settings: {
								end_behavior: {
									missing_payment_method: 'cancel',
								},
							},
						}
					: {}),
			},
		});

		return { url: checkout.url! };
	}

	async findStripeSubscriptionMetadataById(stripeSubscriptionId: string) {
		const stripeSubscription =
				await this.stripe.subscriptions.retrieve(stripeSubscriptionId),
			stripeSubscriptionPrice = stripeSubscription.items.data[0].price,
			metadata = stripeSubscription.metadata as StripeSubscriptionMetaData;

		return {
			stripeSubscription,
			stripeSubscriptionPrice,
			metadata,
		};
	}

	async provisionSubscription(
		stripeSubscriptionId: string,
		prevAttributes?: Partial<Stripe.Subscription>,
	) {
		const { metadata, stripeSubscription, stripeSubscriptionPrice } =
			await this.findStripeSubscriptionMetadataById(stripeSubscriptionId);

		const account = await this.prisma.account.findUniqueOrThrow({
				where: {
					id: Number(metadata.accountId),
				},
				include: {
					account_user: {
						include: {
							user: true,
						},
					},
				},
			}),
			subscription = await this.prisma.subscription.findFirst({
				where: {
					account: account.id,
				},
			});

		const stripeCustomer = stripeSubscription.customer;
		await this.prisma.account.update({
			where: {
				id: account.id,
			},
			data: {
				payment_external_id:
					typeof stripeCustomer === 'string' ? stripeCustomer : stripeCustomer.id,
			},
		});

		if (!account.currency) {
			await this.prisma.account.update({
				where: {
					id: account.id,
				},
				data: {
					currency: stripeSubscriptionPrice.currency.toUpperCase(),
				},
			});
		}

		const subscriptionPlan = await this.prisma.subscription_plan.findFirstOrThrow({
				where: {
					external_id:
						typeof stripeSubscriptionPrice.product === 'string'
							? stripeSubscriptionPrice.product
							: stripeSubscriptionPrice.product.id,
				},
			}),
			subscriptionPlanPrice = await this.prisma.subscription_plan_price.findUniqueOrThrow(
				{
					where: {
						external_id: stripeSubscriptionPrice.id,
					},
				},
			);

		if (
			stripeSubscription.status === 'active' ||
			stripeSubscription.status === 'trialing'
		) {
			const data: Prisma.subscriptionUncheckedCreateInput = {
				account: account.id,
				status: stripeStatusToSubscriptionStatus(stripeSubscription.status),
				subscription_plan: subscriptionPlan.id,
				plan_price: subscriptionPlanPrice.id,
				recurring_interval: stripeSubscriptionPrice.recurring?.interval,
			};

			if (subscription) {
				await this.prisma.subscription.update({
					where: {
						id: subscription.id,
					},
					data,
				});

				if (data.subscription_plan !== subscription.subscription_plan) {
					// User changed subscription plan
					await this.creditsManagerService.updateCreditGivenByPlanOnPlanChange(
						account.id,
						subscriptionPlanPrice,
					);

					await this.usageManagerService.setAccountResetUsageDate(
						Number(metadata.accountId),
						generateNextResetUsageDate(),
					);
				}
			} else {
				const created = await this.prisma.subscription.create({
					data,
				});

				await this.usageManagerService.setAccountResetUsageDate(
					Number(metadata.accountId),
					generateNextResetUsageDate(),
				);

				// Subscription is new
				if (subscriptionPlanPrice.monthly_given_balance) {
					await this.creditsManagerService.updateCreditGivenByPlanOnPlanChange(
						account.id,
						subscriptionPlanPrice,
					);
				}
				this.systemNotificationsService.newSubscription({
					stripePriceId: stripeSubscriptionPrice.id,
					subscription: created,
					subscriptionPlan,
					account,
				});
			}
		} else {
			await this.creditsManagerService.removeCreditGivenByPlan(account.id);

			if (subscription) {
				// Subscription is not active
				await this.prisma.subscription.update({
					where: {
						id: subscription.id,
					},
					data: {
						status: SubscriptionStatus.Cancelled,
					},
				});
			}
		}

		if (prevAttributes) {
			// Subscription status has changed.
			if (prevAttributes.status) {
				// User end trial and has paid the subscription
				if (
					prevAttributes.status === 'trialing' &&
					stripeSubscription.status === 'active'
				) {
					this.systemNotificationsService.subscriptionTrialEndRenew({
						stripePriceId: stripeSubscriptionPrice.id,
						subscriptionPlan,
						account,
					});
				}
			}
		}

		return { account, subscription, subscriptionPlan, stripeSubscription };
	}

	async trackNewSubscription(data: Stripe.Checkout.Session) {
		const stripeSubscriptionId =
			typeof data.subscription === 'string' ? data.subscription : data.subscription!.id;

		const stripeSubscription =
				await this.stripe.subscriptions.retrieve(stripeSubscriptionId),
			stripeSubscriptionPrice = stripeSubscription.items.data[0].price;

		const subscriptionPlan = await this.prisma.subscription_plan.findFirstOrThrow({
			where: {
				external_id:
					typeof stripeSubscriptionPrice.product === 'string'
						? stripeSubscriptionPrice.product
						: stripeSubscriptionPrice.product.id,
			},
		});

		const planPrice = await this.prisma.subscription_plan_price.findUniqueOrThrow({
			where: {
				external_id: stripeSubscriptionPrice.id,
			},
		});

		const user = await this.prisma.user.findUnique({
			where: {
				email: data.customer_email!,
			},
		});

		await this.trackingService.subscriptionPurchase({
			checkoutSessionId: data.id,
			user: user!,

			plan_id: subscriptionPlan.id,
			plan_currency: planPrice.currency,
			plan_name: subscriptionPlan.name,
			plan_period: planPrice.interval as PlanInterval,
			plan_price: planPrice.price!.toNumber(),

			anonymous_id: user!.anonymous_id!,
			subscription_id: stripeSubscription.id,
		});
	}

	async trackRecurringPayment(
		stripeSubscription: Stripe.Response<Stripe.Subscription>,
		data: Stripe.Invoice,
	) {
		const stripeSubscriptionPrice = stripeSubscription.items.data[0].price;

		const subscriptionPlan = await this.prisma.subscription_plan.findFirstOrThrow({
			where: {
				external_id:
					typeof stripeSubscriptionPrice.product === 'string'
						? stripeSubscriptionPrice.product
						: stripeSubscriptionPrice.product.id,
			},
		});

		const planPrice = await this.prisma.subscription_plan_price.findUniqueOrThrow({
			where: {
				external_id: stripeSubscriptionPrice.id,
			},
		});

		const user = await this.prisma.user.findUnique({
			where: {
				email: data.customer_email!,
			},
		});

		await this.trackingService.recurringSubscriptionPayment({
			currency: planPrice.currency,
			value: planPrice.price!.toNumber(),
			anonymous_id: user!.anonymous_id!,
			subscription_id: stripeSubscription.id,
			user: user!,

			plan_id: subscriptionPlan.id,
			plan_currency: planPrice.currency,
			plan_name: subscriptionPlan.name,
			plan_period: planPrice.interval as PlanInterval,
			plan_price: planPrice.price!.toNumber(),
		});
	}

	async trackCancelSubscription(stripeSubscription: Stripe.Subscription) {
		const latestInvoice =
			typeof stripeSubscription.latest_invoice === 'string'
				? await this.stripe.invoices.retrieve(stripeSubscription.latest_invoice)
				: stripeSubscription.latest_invoice;

		const user = await this.prisma.user.findUnique({
			where: {
				email: latestInvoice!.customer_email!,
			},
		});

		await this.trackingService.cancelledSubscription({
			anonymous_id: user!.anonymous_id!,
			user: user!,
			subscription_id: stripeSubscription.id,
		});
	}

	async changeSubscriptionStatusByStripeId(
		stripeSubscriptionId: string,
		status: SubscriptionStatus,
	) {
		const stripeSubscription =
				await this.stripe.subscriptions.retrieve(stripeSubscriptionId),
			metadata = stripeSubscription.metadata as StripeSubscriptionMetaData;

		const account = await this.prisma.account.findUniqueOrThrow({
			where: {
				id: Number(metadata.accountId),
			},
			include: {
				account_user: {
					include: {
						user: true,
					},
				},
			},
		});

		let subscription = await this.prisma.subscription.findFirstOrThrow({
			where: {
				account: account.id,
			},
			include: {
				subscription_plan_subscription_subscription_planTosubscription_plan: true,
			},
		});

		subscription = await this.prisma.subscription.update({
			where: {
				id: subscription.id,
			},
			data: {
				status,
			},
			include: {
				subscription_plan_subscription_subscription_planTosubscription_plan: true,
			},
		});

		return {
			account,
			subscription,
		};
	}

	async createCustomerBillingPortal(userId: number, accountId: number) {
		const account = await this.prisma.account.findFirstOrThrow({
			where: { id: accountId },
			include: {
				account_user: true,
			},
		});

		const isAllowed = account.account_user.some((user) => user.user_id === userId);

		if (!isAllowed) throw new UserNotAAccountMemberError();

		return this.stripe.billingPortal.sessions.create({
			customer: account.payment_external_id!,
		});
	}

	async isSubscriptionActive(_subscription?: ID | subscription | null) {
		if (!_subscription) return false;

		const subscription = await this.mayBeSubscription(_subscription);

		if (!subscription) return false;

		return allowedSubscriptionStatusToPerformOperation.includes(
			subscription?.status as SubscriptionStatus,
		);
	}

	mayBeSubscription(subscription: ID | subscription) {
		return typeof subscription === 'object'
			? subscription
			: this.prisma.subscription.findUnique({
					where: { id: Number(subscription) },
				});
	}
}
