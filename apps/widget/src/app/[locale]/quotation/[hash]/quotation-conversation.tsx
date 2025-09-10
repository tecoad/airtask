'use client';

import { useWidget } from '@/containers/widget/hooks';
import {
	QuotationAvailabilityError,
	QuotationConversationStatus,
	QuotationFragment,
	QuotationMessageRole,
	WidgetTheme,
} from '@/core/shared/api-gql-schema';
import { Widget, WidgetProps } from '@airtask/widget-design';
import { useLocale, useMessages } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';

type Props = {
	data?: QuotationFragment;
	error?: QuotationAvailabilityError;
	themeCookieValue?: WidgetProps['availableThemes'];
};

export const QuotationConversation = ({ data, error, themeCookieValue }: Props) => {
	const { hash } = useParams();
	const framed = useSearchParams().get('framed');
	const {
		isLoading,
		isWriting,
		isThinking,
		messages,
		sendMessage,
		error: errorMessage,
		identifyUser,
		conversation,
		shouldRequireIdentify,
		initConversation,
		quotation,
		onRefresh,
		isRefreshLoading,
	} = useWidget(hash as string, { data, error });

	const settings = (conversation?.quotation || quotation)?.widget_config;

	const themeCookie =
		themeCookieValue === 'dark' || themeCookieValue === 'light'
			? themeCookieValue
			: undefined;

	return (
		<Widget
			i18n={{
				locale: useLocale(),
				messages: useMessages(),
			}}
			globalErrorMessage={errorMessage ?? undefined}
			isLoading={isLoading}
			availableThemes={settings?.theme!}
			activeTheme={
				themeCookie ||
				(settings?.theme as WidgetTheme.Dark | WidgetTheme.Light) ||
				WidgetTheme.Dark
			}
			header={{
				title: settings?.title as string,
				onRefresh,
				isRefreshLoading,
			}}
			content={{
				isThinking,
				// Do not show any message while shouldRequireIdentify
				messages: shouldRequireIdentify
					? []
					: messages.map((v) => ({
							content: v.content,
							role: v.role === QuotationMessageRole.Agent ? 'bot' : 'user',
							sent_at: new Date(v.sent_at),
					  })),
				avatarSrc: settings?.avatar?.url,
			}}
			input={{
				isWriting,

				sendMessage: (input) => {
					sendMessage(input);
				},
				isHidden: conversation?.status === QuotationConversationStatus.Finished,
			}}
			hidePoweredBy={settings?.hide_powered_by!}
			mainColor={settings?.main_color!}
			googleFontName={settings?.google_font!}
			fontSize={settings?.font_size!}
			height={settings?.height!}
			framed={!!framed}
			onUserIdentified={
				// If is loading we don't wanna to show this.
				// Is there isn't a conversation, we need it to inititate the conversation.
				// If shouldRequireIdentify, it means for some reason the conversation is there
				// but without the recipient and we need to identify it.
				!isLoading && (!conversation || shouldRequireIdentify)
					? async (recipient) => {
							// The conversation exists but without recipient. Just need to add it.
							if (conversation) {
								identifyUser(recipient);
								return;
							}
							// Conversation doesn't exists, we need to initiate it with the recipient

							const [firstName, ...rest] = recipient.name.split(' ');

							await initConversation(hash as string, {
								email: recipient.email!,
								first_name: firstName,
								last_name: rest.join(' '),
								phone: recipient.phone,
							});
					  }
					: undefined
			}
		/>
	);
};
