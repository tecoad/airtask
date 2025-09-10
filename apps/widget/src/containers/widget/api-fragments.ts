import { gql } from '@apollo/client';

export const QUOTATION_CONVERSATION_MESSAGE_FRAGMENT = gql`
	fragment QuotationConversationMessage on QuotationConversationMessage {
		content
		role
		sent_at
		is_ending_message
	}
`;

export const WIDGET_CONFIG_FRAGMENT = gql`
	fragment WidgetConfig on WidgetConfig {
		title
		width
		position
		main_color
		initially_open
		hide_powered_by
		height
		google_font
		distance_from_border
		allowed_domains
		button_text_color
		button_text
		button_font_size
		button_color
		button_icon_color
		button_size
		font_size
		theme
		icon {
			id
			url
		}
		avatar {
			id
			url
		}
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
