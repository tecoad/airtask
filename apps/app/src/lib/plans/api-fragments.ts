import { gql } from '@apollo/client';

export const SUBSCRIPTION_PLAN_PRICE_FRAGMENT = gql`
	fragment SubscriptionPlanPrice on SubscriptionPlanPrice {
		price
		currency
		interval
		external_id
	}
`;

export const SUBSCRIPTION_PLAN_FRAGMENT = gql`
	fragment SubscriptionPlan on SubscriptionPlan {
		id
		name
		benefits {
			language
			value
		}
		prices {
			...SubscriptionPlanPrice
		}
	}
	${SUBSCRIPTION_PLAN_PRICE_FRAGMENT}
`;
