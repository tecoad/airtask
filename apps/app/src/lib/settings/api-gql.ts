import { ACCOUNT_FRAGMENT } from '@/lib/sign/api-fragments';
import { gql } from '@apollo/client';
import { ACCOUNT_SEGMENT_FRAGMENT } from './api-fragments';
import { WIDGET_CONFIG_FRAGMENT } from './shared-fragments';

export const UPDATE_ACCOUNT_WIDGET_CONFIG = gql`
	mutation UpdateAccountWidgetConfig($accountId: ID!, $input: WidgetConfigInput!) {
		updateAccountWidgetConfig(accountId: $accountId, input: $input) {
			...WidgetConfig
		}
	}
	${WIDGET_CONFIG_FRAGMENT}
`;

export const ACCOUNT_CONFIG = gql`
	query AccountSettings($accountId: ID!) {
		accountWidgetSettings(accountId: $accountId) {
			...WidgetConfig
		}
	}
	${WIDGET_CONFIG_FRAGMENT}
`;

export const UPDATE_ACCOUNT_SETTINGS = gql`
	mutation UpdateAccountSettings($input: UpdateAccountSettingsInput!) {
		updateAccountSettings(input: $input) {
			...Account
		}
	}
	${ACCOUNT_FRAGMENT}
`;

export const AVAILABLE_SEGMENTS = gql`
	query AvailableSegments {
		availableSegments {
			...Segment
		}
	}
	${ACCOUNT_SEGMENT_FRAGMENT}
`;
