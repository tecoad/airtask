import { Prisma } from '@prisma/client';
import { ENV } from 'src/config/env';
import { LanguageCode } from 'src/graphql';
import { AffiliatesService } from 'src/modules/affiliates/services/affiliates.service';
import { EmailService } from 'src/modules/common/services/email.service';
import { StripeService } from 'src/modules/common/services/stripe.service';
import { StripeCheckoutMetaData } from 'src/modules/subscriptions/types';
import {
	AccountCreditTransactionReason,
	AccountRole,
	SubscriptionStatus,
} from 'src/shared/types/db';
import Stripe from 'stripe';
import { CreditsManagerService } from '../services/credits-manager.service';
import { SubscriptionManagerService } from '../services/subscription-manager.service';

import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SystemNotificationsService } from 'src/modules/common/services/system-notifications.service';

export const STRIPE_QUEUE = 'stripe-queue';
export const STRIPE_PROCESS_CALLBACK_JOB = 'stripe-process-callback-job';

@Processor(STRIPE_QUEUE)
export class StripeQueue {
	constructor(
		private readonly subscriptionManagerService: SubscriptionManagerService,
		private readonly creditsManagerService: CreditsManagerService,
		private readonly stripe: StripeService,
		private readonly emailService: EmailService,
		private readonly affiliatesService: AffiliatesService,
		private readonly systemNotificationsService: SystemNotificationsService,
	) {}

	@Process(STRIPE_PROCESS_CALLBACK_JOB)
	async processWebhook(job: Job<Stripe.Event>) {
		const { data: event } = job;

		switch (event.type) {
			case 'checkout.session.completed': {
				const data = event.data.object as Stripe.Checkout.Session;
				const metadata = data.metadata as StripeCheckoutMetaData;

				if (metadata.kind === 'subscription-purchase') {
					await this.subscriptionManagerService.trackNewSubscription(data);
				} else if (metadata.kind === 'extra-credits-purchase') {
					const credit = await this.creditsManagerService.creditForAccount(
						Number(metadata.accountId),
						{
							amount: new Prisma.Decimal(data.amount_total! / 100),
							reason: AccountCreditTransactionReason.CreditBuy,
						},
					);

					this.systemNotificationsService.extraCreditPurchase({
						accountId: credit.account,
						value: credit.amount,
					});
				}

				break;
			}
			case 'invoice.paid': {
				// Continue to provision the subscription as payments continue to be made.
				const data = event.data.object as Stripe.Invoice;

				const maybeStripeSubscription = data.subscription;

				if (maybeStripeSubscription) {
					const subscriptionLine = data.lines.data[0];

					const stripeSubscriptionId =
						typeof maybeStripeSubscription === 'string'
							? maybeStripeSubscription
							: maybeStripeSubscription.id;
					const { account, stripeSubscription } =
						await this.subscriptionManagerService.provisionSubscription(
							stripeSubscriptionId,
						);

					await this.affiliatesService.createAccountSubscriptionComissionIfNeeded(
						account.id,
						new Prisma.Decimal(subscriptionLine.amount / 100),
					);

					await this.subscriptionManagerService.trackRecurringPayment(
						stripeSubscription,
						data,
					);
				}

				break;
			}
			case 'invoice.payment_failed': {
				const data = event.data.object as Stripe.Invoice;
				const stripeSubscription = data.subscription;

				if (stripeSubscription) {
					const { account } =
						await this.subscriptionManagerService.changeSubscriptionStatusByStripeId(
							typeof stripeSubscription === 'string'
								? stripeSubscription
								: stripeSubscription.id,
							SubscriptionStatus.Pending,
						);

					const accountOwner = account.account_user.find(
						(item) => item.role === AccountRole.Owner,
					);
					await this.emailService.subscriptionPaymentFailed(
						accountOwner?.user?.email as string,
						{
							firstname: accountOwner?.user?.first_name as string,
							languageCode: accountOwner?.user?.language as LanguageCode,
							app_url: ENV.REDIRECTS.app_url,
						},
					);
				}

				break;
			}
			// case 'customer.subscription.created': {
			// 	const data = event.data.object as Stripe.Subscription,
			// 		metadata = data.metadata as StripeSubscriptionMetaData;

			// 	// await this.usageManagerService.setAccountResetUsageDate(
			// 	// 	Number(metadata.accountId),
			// 	// 	generateNextResetUsageDate(),
			// 	// );

			// 	break;
			// }
			case 'customer.subscription.deleted': {
				const data = event.data.object as Stripe.Subscription;
				await this.subscriptionManagerService.changeSubscriptionStatusByStripeId(
					data.id,
					SubscriptionStatus.Cancelled,
				);

				await this.subscriptionManagerService.trackCancelSubscription(data);

				break;
			}
			case 'customer.subscription.updated': {
				const data = event.data.object as Stripe.Subscription;

				// Here we provision it again to ensure/refresh subscription plan
				await this.subscriptionManagerService.provisionSubscription(
					data.id,
					event.data.previous_attributes,
				);

				break;
			}

			default:
			// Unhandled event type
		}

		await job.progress(100);

		return {
			handled: true,
		};
	}
}
