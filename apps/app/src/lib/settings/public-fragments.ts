import { gql } from '@apollo/client';
import { WIDGET_CONFIG_FRAGMENT } from './shared-fragments';

export const PUBLIC_QUOTATION_FRAGMENT = gql`
	fragment PublicQuotation on PublicQuotation {
		hash
		title
		widget_config {
			...WidgetConfig
		}
	}
	${WIDGET_CONFIG_FRAGMENT}
`;
