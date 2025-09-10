import gql from 'graphql-tag';
import { WIDGET_CONFIG_FRAGMENT } from '../shared/settings-fragments';

export const QUOTATION_QUESTION_FRAGMENT = gql`
	fragment QuotationQuestion on QuotationQuestion {
		id
		label
		quotation
		parent
		active
		condition
		order
	}
`;

export const QUOTATION_FRAGMENT = gql`
	fragment Quotation on Quotation {
		id
		hash
		title
		status
		prompt_instructions
		questions {
			...QuotationQuestion
		}
		widget_config {
			...WidgetConfig
		}
		date_created
		date_updated
	}
	${QUOTATION_QUESTION_FRAGMENT}
	${WIDGET_CONFIG_FRAGMENT}
`;

export const QUOTATION_WITH_COUNTS_FRAGMENT = gql`
	fragment QuotationWithCounts on Quotation {
		...Quotation
		requests_count
		questions_count
	}
	${QUOTATION_FRAGMENT}
`;

export const CREATE_QUOTATION = gql`
	mutation CreateQuotation($input: CreateQuotationInput!) {
		createQuotation(input: $input) {
			...Quotation
		}
	}
	${QUOTATION_FRAGMENT}
`;

export const UPDATE_QUOTATION = gql`
	mutation UpdateQuotation($input: UpdateQuotationInput!) {
		updateQuotation(input: $input) {
			...Quotation
		}
	}
	${QUOTATION_FRAGMENT}
`;

export const ACCOUNT_QUOTATION = gql`
	query AccountQuotation($accountQuotationId: ID!) {
		accountQuotation(id: $accountQuotationId) {
			...QuotationWithCounts
		}
	}
	${QUOTATION_WITH_COUNTS_FRAGMENT}
`;

export const ACCOUNT_QUOTATIONS = gql`
	query AccountQuotations($mode: SoftDeleteQueryMode!, $account: ID!) {
		accountQuotations(mode: $mode, account: $account) {
			...Quotation
		}
	}
	${QUOTATION_FRAGMENT}
`;

export const DELETE_QUOTATION = gql`
	mutation DeleteQuotation($deleteQuotationId: ID!) {
		deleteQuotation(id: $deleteQuotationId)
	}
`;

export const CREATE_QUOTATION_QUESTION = gql`
	mutation CreateQuotationQuestion($input: [CreateQuotationQuestionInput!]!) {
		createQuotationQuestion(input: $input) {
			...QuotationQuestion
		}
	}
	${QUOTATION_QUESTION_FRAGMENT}
`;

export const UPDATE_QUOTATION_QUESTION = gql`
	mutation UpdateQuotationQuestion($input: UpdateQuotationQuestionInput!) {
		updateQuotationQuestion(input: $input) {
			...QuotationQuestion
		}
	}
	${QUOTATION_QUESTION_FRAGMENT}
`;

export const DELETE_QUOTATION_QUESTION = gql`
	mutation DeleteQuotationQuestion($deleteQuotationQuestionId: ID!) {
		deleteQuotationQuestion(id: $deleteQuotationQuestionId)
	}
`;

export const QUOTATION_MODEL_BY_SEGMENT = gql`
	query QuotationModelBySegment($segmentId: ID!) {
		quotationModelBySegment(segmentId: $segmentId) {
			...Quotation
		}
	}
	${QUOTATION_FRAGMENT}
`;

export const AVAILABLE_SEGMENTS = gql`
	query AvailableSegments {
		availableSegments {
			title
			translations {
				language
				value
			}
		}
	}
`;
