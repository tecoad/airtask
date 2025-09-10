import { gql } from '@apollo/client';
import {
	ASSET_FRAGMENT,
	FULL_QUOTATION_REQUEST_FRAGMENT,
	QUOTATION_FRAGMENT,
	QUOTATION_METRICS_FRAGMENT,
	QUOTATION_QUESTION_FRAGMENT,
	QUOTATION_WIDGET_CONFIG_FRAGMENT,
	QUOTATION_WITH_COUNTS_FRAGMENT,
	SIMPLE_QUOTATION_REQUEST_FRAGMENT,
} from './api-fragments';

export const ACCOUNT_QUOTATIONS = gql`
	query AccountQuotations($account: ID!, $mode: SoftDeleteQueryMode!) {
		accountQuotations(account: $account, mode: $mode) {
			...QuotationWithCounts
		}
	}
	${QUOTATION_WITH_COUNTS_FRAGMENT}
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

export const UPDATE_QUOTATION_WIDGET_SETTINGS = gql`
	mutation UpdateQuotationWidgetSettings($input: UpdateQuotationInput!) {
		updateQuotation(input: $input) {
			...QuotationWidgetConfig
		}
	}
	${QUOTATION_WIDGET_CONFIG_FRAGMENT}
`;

export const CREATE_QUOTATION_QUESTION = gql`
	mutation CreateQuotationQuestion($input: [CreateQuotationQuestionInput!]!) {
		createQuotationQuestion(input: $input) {
			...QuotationQuestion
		}
	}
	${QUOTATION_QUESTION_FRAGMENT}
`;

export const DELETE_ACCOUNT_QUOTATION = gql`
	mutation DeleteQuotation($deleteQuotationId: ID!) {
		deleteQuotation(id: $deleteQuotationId)
	}
`;

export const ACCOUNT_QUOTATION = gql`
	query AccountQuotation($accountQuotationId: ID!) {
		accountQuotation(id: $accountQuotationId) {
			...Quotation
		}
	}
	${QUOTATION_FRAGMENT}
`;

export const ACCOUNT_QUOTATION_METRICS = gql`
	query AccountQuotationMetrics($accountQuotationId: ID!) {
		accountQuotation(id: $accountQuotationId) {
			...QuotationMetrics
		}
	}
	${QUOTATION_METRICS_FRAGMENT}
`;

export const ACCOUNT_QUOTATION_WIDGET_SETTINGS = gql`
	query AccountQuotationWidgetSettings($accountQuotationId: ID!) {
		accountQuotation(id: $accountQuotationId) {
			...QuotationWidgetConfig
		}
	}
	${QUOTATION_WIDGET_CONFIG_FRAGMENT}
`;

export const DELETE_QUOTATION_QUESTION = gql`
	mutation DeleteQuotationQuestion($deleteQuotationQuestionId: ID!) {
		deleteQuotationQuestion(id: $deleteQuotationQuestionId)
	}
`;

export const UPDATE_QUOTATION_QUESTION = gql`
	mutation UpdateQuotationQuestion($input: UpdateQuotationQuestionInput!) {
		updateQuotationQuestion(input: $input) {
			id
		}
	}
`;

export const UPLOAD_FILE = gql`
	mutation UploadFile($file: Upload!) {
		uploadFile(file: $file) {
			...Asset
		}
	}
	${ASSET_FRAGMENT}
`;

export const QUOTATION_MODEL_BY_SEGMENT = gql`
	query QuotationModelBySegment($segmentId: ID!) {
		quotationModelBySegment(segmentId: $segmentId) {
			...Quotation
		}
	}
	${QUOTATION_FRAGMENT}
`;

export const QUOTATION_REQUESTS = gql`
	query AccountQuotationRequests(
		$accountId: ID!
		$pagination: PaginatedQuotationRequestListOptions
		$filter: QuotationRequestFilter
	) {
		accountQuotationRequests(
			accountId: $accountId
			pagination: $pagination
			filter: $filter
		) {
			items {
				...SimpleQuotationRequest
			}
			totalItems
		}
	}
	${SIMPLE_QUOTATION_REQUEST_FRAGMENT}
`;

export const QUOTATION_REQUEST = gql`
	query AccountQuotationRequest($quotationId: ID!, $requestSequentialId: ID!) {
		accountQuotationRequest(
			quotationId: $quotationId
			requestSequentialId: $requestSequentialId
		) {
			...FullQuotationRequest
		}
	}
	${FULL_QUOTATION_REQUEST_FRAGMENT}
`;

export const VISUALIZE_QUOTATION_REQUEST = gql`
	mutation VisualizeQuotationRequest($requestId: [ID!]!) {
		visualizeQuotationRequest(requestId: $requestId)
	}
`;

export const TOGGLE_QUOTATION_REQUEST_CHECK = gql`
	mutation ToggleQuotationRequestCheck($requestId: [ID!]!) {
		toggleQuotationRequestCheck(requestId: $requestId) {
			...FullQuotationRequest
		}
	}
	${FULL_QUOTATION_REQUEST_FRAGMENT}
`;
