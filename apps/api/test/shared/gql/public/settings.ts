import gql from 'graphql-tag';
import { WIDGET_CONFIG_FRAGMENT } from '../shared/settings-fragments';

export const QUOTATION_WIDGET_SETTINGS = gql`
	query QuotationWidgetSettings($hash: String, $id: ID) {
		quotationWidgetSettings(hash: $hash, id: $id) {
			...WidgetConfig
		}
	}
	${WIDGET_CONFIG_FRAGMENT}
`;
