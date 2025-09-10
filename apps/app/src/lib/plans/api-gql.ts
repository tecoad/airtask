import { gql } from '@apollo/client';
import { SUBSCRIPTION_PLAN_FRAGMENT } from './api-fragments';

export const SUBSCRIPTION_PLANS = gql`
	query SubscriptionPlans {
		subscriptionPlans {
			...SubscriptionPlan
		}
	}
	${SUBSCRIPTION_PLAN_FRAGMENT}
`;

export const CREATE_SUBSCRIPTION_CHECKOUT = gql`
	mutation CreateSubscriptionCheckout($input: CreateSubscriptionCheckoutInput!) {
		createSubscriptionCheckout(input: $input) {
			url
		}
	}
`;
