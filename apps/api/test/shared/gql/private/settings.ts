import gql from 'graphql-tag';
import { WIDGET_CONFIG_FRAGMENT } from '../shared/settings-fragments';

export const ACCOUNT_WIDGET_SETTINGS = gql`
	query AccountWidgetSettings($accountId: ID!) {
		accountWidgetSettings(accountId: $accountId) {
			...WidgetConfig
		}
	}
	${WIDGET_CONFIG_FRAGMENT}
`;

export const UPDATE_ACCOUNT_WIDGET_SETTINGS = gql`
	mutation UpdateAccountWidgetConfig($accountId: ID!, $input: WidgetConfigInput!) {
		updateAccountWidgetConfig(accountId: $accountId, input: $input) {
			...WidgetConfig
		}
	}
	${WIDGET_CONFIG_FRAGMENT}
`;
