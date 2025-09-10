import { gql } from '@apollo/client';
import { ACCOUNT_SUBSCRIPTION_DATA_FRAGMENT } from './api-fragments';

export const ACCOUNT_SUBSCRIPTION_DATA = gql`
	query AccountSubscriptionData($accountId: ID!) {
		accountSubscriptionData(accountId: $accountId) {
			...AccountSubscriptionData
		}
	}
	${ACCOUNT_SUBSCRIPTION_DATA_FRAGMENT}
`;

export const SUBSCRIPTION_PORTAL = gql`
	query SubscriptionPortal($input: SubscriptionPortalInput!) {
		subscriptionPortal(input: $input) {
			url
		}
	}
`;

export const CREATE_EXTRA_CREDIT_PRODUCT_CHECKOUT = gql`
	mutation CreateExtraCreditCheckout($input: CreateExtraCreditCheckoutInput!) {
		createExtraCreditCheckout(input: $input) {
			url
		}
	}
`;
