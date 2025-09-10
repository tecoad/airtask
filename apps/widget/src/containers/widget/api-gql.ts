import { gql } from '@apollo/client';
import {
	QUOTATION_CONVERSATION_FRAGMENT,
	QUOTATION_CONVERSATION_MESSAGE_FRAGMENT,
	QUOTATION_FRAGMENT,
	QUOTATION_RECIPIENT_FRAGMENT,
} from './api-fragments';

export const INIT_QUOTATION_CONVERSATION = gql`
	subscription InitQuotationConversation(
		$hash: String!
		$recipient: QuotationConversationRecipientInput
	) {
		initQuotationConversation(hash: $hash, recipient: $recipient) {
			...QuotationConversation
			...QuotationConversationMessage
			... on QuotationConversationMessageToken {
				token
			}
			... on QuotationAvailabilityError {
				errorCode
				errorMessage: message
			}
		}
	}
	${QUOTATION_CONVERSATION_FRAGMENT}
	${QUOTATION_CONVERSATION_MESSAGE_FRAGMENT}
`;

export const SEND_QUOTATION_MESSAGE = gql`
	subscription SendQuotationConversationMessage(
		$input: SendQuotationConversationMessageInput!
	) {
		sendQuotationConversationMessage(input: $input) {
			...QuotationConversationMessage
			... on QuotationConversationMessageToken {
				token
			}
		}
	}
	${QUOTATION_CONVERSATION_MESSAGE_FRAGMENT}
`;

export const GET_QUOTATION_CONVERSATION = gql`
	query QuotationConversation($quotationConversationId: ID!) {
		quotationConversation(id: $quotationConversationId) {
			...QuotationConversation
			... on QuotationAvailabilityError {
				errorCode
				errorMessage: message
			}
		}
	}
	${QUOTATION_CONVERSATION_FRAGMENT}
`;

export const UPDATE_QUOTATION_CONVERSATION_RECIPIENT = gql`
	mutation UpdateQuotationConversationRecipient(
		$quotationConversationId: ID!
		$recipient: QuotationConversationRecipientInput
	) {
		updateQuotationConversationRecipient(
			quotationConversationId: $quotationConversationId
			recipient: $recipient
		) {
			...ConversationRecipient
		}
	}
	${QUOTATION_RECIPIENT_FRAGMENT}
`;

export const QUOTATION_BY_HASH = gql`
	query QuotationByHash($hash: String!) {
		publicQuotation(hash: $hash) {
			...Quotation
			... on QuotationAvailabilityError {
				errorCode
				message
			}
			__typename
		}
	}
	${QUOTATION_FRAGMENT}
`;

export const PUBLIC_QUOTATION_WITHOUT_AVAILABILITY = gql`
	query PublicQuotation($publicQuotationId: ID, $hash: String) {
		findPublicWithoutAvailabilityCheck(id: $publicQuotationId, hash: $hash) {
			...Quotation
		}
	}
	${QUOTATION_FRAGMENT}
`;
