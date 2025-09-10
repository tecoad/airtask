import gql from 'graphql-tag';
import {
	QUOTATION_CONVERSATION_FRAGMENT,
	QUOTATION_CONVERSATION_MESSAGE_FRAGMENT,
	QUOTATION_RECIPIENT_FRAGMENT,
} from './quotation-fragments';

export const PUBLIC_QUOTATION = gql`
	query PublicQuotation($hash: String, $id: ID) {
		publicQuotation(hash: $hash, id: $id) {
			... on QuotationAvailabilityError {
				message
				errorCode
			}
			... on PublicQuotation {
				widget_config {
					button_size
					button_color
				}
				hash
				title
			}
		}
	}
`;

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
			__typename
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
			__typename
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
