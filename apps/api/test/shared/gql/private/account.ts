import gql from 'graphql-tag';
import {
	ACCOUNT_FRAGMENT,
	ACCOUNT_SETTINGS_FRAGMENT,
	ONBOARDING_STEP_FRAGMENT,
} from './account-user-fragments';

export const QUERY_ACCOUNT_SETTINGS = gql`
	query AccountSettings($accountId: ID!) {
		account(id: $accountId) {
			...AccountSettings
		}
	}
	${ACCOUNT_SETTINGS_FRAGMENT}
`;

export const QUERY_ACCOUNT = gql`
	query Account($accountId: ID!) {
		account(id: $accountId) {
			...Account
		}
	}
	${ACCOUNT_FRAGMENT}
`;

export const UPDATE_ACCOUNT_SETTINGS = gql`
	mutation UpdateAccountSettings($input: UpdateAccountSettingsInput!) {
		updateAccountSettings(input: $input) {
			...AccountSettings
		}
	}
	${ACCOUNT_SETTINGS_FRAGMENT}
`;

export const ACCOUNT_SUBSCRIPTION_DATA = gql`
	query AccountSubscriptionData($accountId: ID!) {
		accountSubscriptionData(accountId: $accountId) {
			plan
			plan_interval
			credits
			period_end
			period_start
		}
	}
`;

export const REGISTER_ACCOUNT_ONBOARDING_STEP = gql`
	mutation RegisterOnboardingStepForAccount($accountId: ID!, $step: OnBoardingStepName!) {
		registerOnboardingStepForAccount(accountId: $accountId, step: $step) {
			...OnBoardingStep
		}
	}
	${ONBOARDING_STEP_FRAGMENT}
`;
