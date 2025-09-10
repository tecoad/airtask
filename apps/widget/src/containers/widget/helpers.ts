import {
	QuotationAvailabilityError,
	QuotationAvailabilityErrorCode,
	QuotationConversationFragment,
} from '@/core/shared/api-gql-schema';
import { useTranslations } from 'next-intl';
import { Message } from './hooks';

export const deleteConversationId = (hash: string) => {
	localStorage.removeItem(`conversationId-${hash}`);
};

export const setConversationId = (hash: string, id: string) => {
	hash?.trim() && localStorage.setItem(`conversationId-${hash}`, id);
};

export const getConversationId = (hash: string) => {
	return localStorage.getItem(`conversationId-${hash}`);
};

export const conversationToMessages = (
	conversation: QuotationConversationFragment,
): Message[] => {
	return conversation.message
		.slice()
		.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
};

export const getHandleQuotationAvailabilityError = (
	t: ReturnType<typeof useTranslations>,
) => {
	return (data: QuotationAvailabilityError) => {
		switch (data.errorCode) {
			case QuotationAvailabilityErrorCode.QuotationWithoutActiveSubscription: {
				return t('errors.quotationWithoutActiveSubscription');
			}
			case QuotationAvailabilityErrorCode.QuotationNotFound: {
				return t('errors.quotationNotFound');
			}
		}
	};
};
