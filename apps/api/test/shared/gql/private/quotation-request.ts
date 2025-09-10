import gql from 'graphql-tag';
import { QUOTATION_REQUEST_FRAGMENT } from './quotation-request-fragments';

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
				...QuotationRequest
			}
			totalItems
		}
	}
	${QUOTATION_REQUEST_FRAGMENT}
`;

export const QUOTATION_REQUEST = gql`
	query AccountQuotationRequest($quotationId: ID!, $requestSequentialId: ID!) {
		accountQuotationRequest(
			quotationId: $quotationId
			requestSequentialId: $requestSequentialId
		) {
			...QuotationRequest
		}
	}
	${QUOTATION_REQUEST_FRAGMENT}
`;

export const VISUALIZE_QUOTATION_REQUEST = gql`
	mutation VisualizeQuotationRequest($requestId: [ID!]!) {
		visualizeQuotationRequest(requestId: $requestId)
	}
`;

export const TOGGLE_QUOTATION_REQUEST_CHECK = gql`
	mutation ToggleQuotationRequestCheck($requestId: [ID!]!) {
		toggleQuotationRequestCheck(requestId: $requestId) {
			...QuotationRequest
		}
	}
	${QUOTATION_REQUEST_FRAGMENT}
`;
