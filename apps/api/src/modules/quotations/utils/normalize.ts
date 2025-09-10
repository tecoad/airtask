import { quotation_conversation } from '@prisma/client';
import { QuotationConversationRecipient } from 'src/public-graphql';

export const quotationConversationToRecipient = (
	conversation: quotation_conversation,
): QuotationConversationRecipient | null => {
	const obj = {
		email: conversation.recipient_email!,
		first_name: conversation.recipient_first_name!,
		last_name: conversation.recipient_last_name!,
		phone: conversation.recipient_phone,
	};

	const isAllEmpty = Object.values(obj).every((v) => !v);

	return isAllEmpty ? null : obj;
};
