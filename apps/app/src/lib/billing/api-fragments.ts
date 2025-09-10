import { gql } from '@apollo/client';

export const ACCOUNT_SUBSCRIPTION_DATA_FRAGMENT = gql`
	fragment AccountSubscriptionData on AccountSubscriptionData {
		credits
		plan
		plan_interval
		period_start
		period_end
	}
`;
