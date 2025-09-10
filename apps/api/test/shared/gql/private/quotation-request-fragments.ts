import gql from 'graphql-tag';
import { USER_FRAGMENT } from './account-user-fragments';
import { QUOTATION_FRAGMENT } from './quotation';

export const QUOTATION_CONVERSATION_RECIPIENT_FRAGMENT = gql`
	fragment QuotationConversationRecipient on QuotationConversation {
		id
		recipient {
			email
			first_name
			last_name
			phone
		}
	}
`;

export const QUOTATION_REQUEST_FRAGMENT = gql`
	fragment QuotationRequest on QuotationRequest {
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
			...QuotationConversationRecipient
		}
		quotation {
			...Quotation
		}
	}
	${USER_FRAGMENT}
	${QUOTATION_FRAGMENT}
	${QUOTATION_CONVERSATION_RECIPIENT_FRAGMENT}
`;
