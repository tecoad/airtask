import { SubscriptionStatus } from 'src/shared/types/db';
import Stripe from 'stripe';

export const stripeStatusToSubscriptionStatus = (
	stripeStatus: Stripe.Subscription.Status,
): SubscriptionStatus => {
	switch (stripeStatus) {
		case 'active':
			return SubscriptionStatus.Active;
		case 'trialing':
			return SubscriptionStatus.Trialing;
		case 'incomplete':
		case 'past_due':
			return SubscriptionStatus.Pending;
		case 'canceled':
		case 'incomplete_expired':
		case 'paused':
		case 'unpaid':
			return SubscriptionStatus.Cancelled;
	}
};
