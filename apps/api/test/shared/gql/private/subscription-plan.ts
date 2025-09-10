import gql from 'graphql-tag';

export const SUBSCRIPTION_PLANS = gql`
	query SubscriptionPlans {
		subscriptionPlans {
			id
			name
			prices {
				price
				currency
				interval
				external_id
			}
		}
	}
`;
