import gql from 'graphql-tag';
import { WIDGET_CONFIG_FRAGMENT } from '../shared/settings-fragments';

export const QUOTATION_CONVERSATION_MESSAGE_FRAGMENT = gql`
	fragment QuotationConversationMessage on QuotationConversationMessage {
		content
		role
		sent_at
		is_ending_message
	}
`;

export const QUOTATION_FRAGMENT = gql`
	fragment Quotation on PublicQuotation {
		title
		hash
		widget_config {
			...WidgetConfig
		}
	}
	${WIDGET_CONFIG_FRAGMENT}
`;

export const QUOTATION_RECIPIENT_FRAGMENT = gql`
	fragment ConversationRecipient on QuotationConversationRecipient {
		email
		first_name
		last_name
		phone
	}
`;

export const QUOTATION_CONVERSATION_FRAGMENT = gql`
	fragment QuotationConversation on QuotationConversation {
		id
		status
		message {
			...QuotationConversationMessage
		}
		recipient {
			...ConversationRecipient
		}
		quotation {
			...Quotation
		}
	}
	${QUOTATION_FRAGMENT}
	${QUOTATION_CONVERSATION_MESSAGE_FRAGMENT}
	${QUOTATION_RECIPIENT_FRAGMENT}
`;
