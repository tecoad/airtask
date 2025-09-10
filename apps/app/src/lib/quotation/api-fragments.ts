import { USER_FRAGMENT } from '@/lib/sign/api-fragments';
import { gql } from '@apollo/client';
import { WIDGET_CONFIG_FRAGMENT } from '../settings/shared-fragments';

export const QUOTATION_EXHIBITION_FRAGMENT = gql`
	fragment QuotationExhibition on Quotation {
		id
		hash
		date_updated
		date_created
		status
		title
		questions_count
		requests_count
	}
`;

export const QUOTATION_WITH_COUNTS_FRAGMENT = gql`
	fragment QuotationWithCounts on Quotation {
		id
		hash
		date_updated
		date_created
		status
		title
		questions_count
		requests_count
	}
`;

export const QUOTATION_QUESTION_FRAGMENT = gql`
	fragment QuotationQuestion on QuotationQuestion {
		id
		label
		order
		condition
		parent
		quotation
		active
	}
`;

export const QUOTATION_FRAGMENT = gql`
	fragment Quotation on Quotation {
		id
		hash
		questions {
			...QuotationQuestion
		}
		title
		status
		prompt_instructions
		date_updated
		date_created
		date_deleted
	}
	${QUOTATION_QUESTION_FRAGMENT}
`;

export const QUOTATION_WIDGET_CONFIG_FRAGMENT = gql`
	fragment QuotationWidgetConfig on Quotation {
		id
		hash
		widget_config {
			...WidgetConfig
		}
	}
	${WIDGET_CONFIG_FRAGMENT}
`;

export const ASSET_FRAGMENT = gql`
	fragment Asset on Asset {
		id
		url
	}
`;

export const QUOTATION_CONVERSATION_FRAGMENT = gql`
	fragment QuotationConversation on QuotationConversation {
		id
		recipient {
			email
			first_name
			last_name
			phone
		}
	}
`;

export const FULL_QUOTATION_REQUEST_FRAGMENT = gql`
	fragment FullQuotationRequest on QuotationRequest {
		id
		sequential_id
		data {
			answer
			question
		}
		date_created
		date_updated
		checked_at
		visualized_at
		checked_by {
			...User
		}
		conversation {
			...QuotationConversation
		}
		quotation {
			...Quotation
		}
	}
	${USER_FRAGMENT}
	${QUOTATION_FRAGMENT}
	${QUOTATION_CONVERSATION_FRAGMENT}
`;

export const SIMPLE_QUOTATION_REQUEST_FRAGMENT = gql`
	fragment SimpleQuotationRequest on QuotationRequest {
		id
		sequential_id
		date_created
		date_updated
		checked_at
		visualized_at
		quotation {
			...Quotation
		}
		conversation {
			...QuotationConversation
		}
	}
	${QUOTATION_FRAGMENT}
	${QUOTATION_CONVERSATION_FRAGMENT}
`;

export const QUOTATION_METRICS_FRAGMENT = gql`
	fragment QuotationMetrics on Quotation {
		id
		hash
		title
		requests_count
	}
`;
