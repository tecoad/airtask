import { apiClient } from '@/core/services/graphql/client';
import {
	InitQuotationConversationSubscription,
	InitQuotationConversationSubscriptionVariables,
	QuotationAvailabilityError,
	QuotationConversationFragment,
	QuotationConversationMessageFragment,
	QuotationConversationQuery,
	QuotationConversationQueryVariables,
	QuotationConversationRecipientInput,
	QuotationConversationStatus,
	QuotationFragment,
	QuotationMessageRole,
	SendQuotationConversationMessageSubscription,
	SendQuotationConversationMessageSubscriptionVariables,
	UpdateQuotationConversationRecipientMutation,
	UpdateQuotationConversationRecipientMutationVariables,
} from '@/core/shared/api-gql-schema';
import type { UserIdentifierForm } from '@airtask/widget-design';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	GET_QUOTATION_CONVERSATION,
	INIT_QUOTATION_CONVERSATION,
	SEND_QUOTATION_MESSAGE,
	UPDATE_QUOTATION_CONVERSATION_RECIPIENT,
} from './api-gql';
import {
	conversationToMessages,
	deleteConversationId,
	getConversationId,
	getHandleQuotationAvailabilityError,
	setConversationId,
} from './helpers';

type UseWidget = {
	isLoading: boolean;
	isWriting: boolean;
	isThinking: boolean;
	error: string | null;
	quotation: QuotationFragment | null;
	conversation: QuotationConversationFragment | null;
	messages: Message[];
	initConversation: (
		hash: string,
		recipient?: QuotationConversationRecipientInput,
	) => Promise<QuotationConversationFragment | undefined>;
	sendMessage: (
		content: string,
	) => Promise<QuotationConversationMessageFragment | undefined>;
	getConversation: () => Promise<QuotationConversationFragment | undefined>;

	isRefreshLoading: boolean;
	onRefresh: () => Promise<void>;

	shouldRequireIdentify: boolean;
	identifyUser: (input: UserIdentifierForm) => Promise<void>;
};

export type Message = {
	role: QuotationMessageRole;
	content: string;
	sent_at: string;
};

export const useWidget = (
	quotationHash: string,
	initialStates?: {
		data?: QuotationFragment;
		error?: QuotationAvailabilityError;
	},
): UseWidget => {
	const { data: initialQuotation, error: initialErrorObject } = initialStates || {};
	const t = useTranslations();
	const [isLoading, setLoading] = useState(false);
	const [isWriting, setWriting] = useState(false);
	const [isThinking, setThinking] = useState(false);
	const [isRefreshLoading, setRefreshLoading] = useState(false);
	const [quotation, setQuotation] = useState<QuotationFragment | null>(
		initialQuotation ?? null,
	);
	const [conversation, setConversation] = useState<QuotationConversationFragment | null>(
		null,
	);
	const [messages, setMessages] = useState<Message[]>([]);
	const [error, setError] = useState<string | null>(
		initialErrorObject
			? getHandleQuotationAvailabilityError(t)(initialErrorObject)
			: null,
	);
	const conversationId = useRef<string | null>(null);

	const pushNewMessage = useCallback(
		(message: Message) => {
			setMessages((prev) => {
				const clone = [message, ...(prev || [])];

				return clone;
			});
		},
		[setMessages],
	);

	const setLastBotMessage = useCallback(
		(message: Message) => {
			setMessages((prev) => {
				const clone = [...(prev || [])];

				clone[0] = message;

				return clone;
			});
		},
		[setMessages],
	);

	const pushResponseMessagePiece = useCallback(
		(piece: string) => {
			setMessages((prev) => {
				const clone = [...(prev || [])];

				if (!clone[0] || clone[0].role === QuotationMessageRole.Customer) {
					clone.unshift({
						role: QuotationMessageRole.Agent,
						content: piece,
						sent_at: new Date().toISOString(),
					});
				} else {
					clone[0] = {
						content: clone[0].content + piece,
						role: QuotationMessageRole.Agent,
						sent_at: clone[0].sent_at,
					};
				}

				return clone;
			});
		},
		[setMessages],
	);

	const initConversation: UseWidget['initConversation'] = useCallback(
		async (hash, recipient) => {
			setWriting(true);

			let isFirstToken = true;

			try {
				return new Promise(async (resolve) => {
					const obs = apiClient
						.subscribe<
							InitQuotationConversationSubscription,
							InitQuotationConversationSubscriptionVariables
						>({
							query: INIT_QUOTATION_CONVERSATION,
							variables: {
								hash,
								recipient,
							},
						})
						.subscribe({
							next({ data }) {
								let conversation: QuotationConversationFragment | null = null;

								switch (data?.initQuotationConversation?.__typename) {
									// The first receive on success. Used to load config
									case 'QuotationConversation': {
										resolve(conversation!);
										setThinking(true);
										setLoading(false);

										conversation = data.initQuotationConversation;
										setConversation(conversation);
										setQuotation(conversation.quotation!);

										// Ensure refresh
										if (getConversationId(quotationHash)) {
											deleteConversationId(quotationHash);
										}

										setConversationId(quotationHash, conversation.id);
										conversationId.current = conversation.id;
										setMessages(conversationToMessages(conversation));

										break;
									}
									// Second on success. Bot started to write
									case 'QuotationConversationMessageToken': {
										if (isFirstToken) {
											isFirstToken = false;
											setThinking(false);
										}

										pushResponseMessagePiece(data.initQuotationConversation.token);
										break;
									}
									// Third on success. Bot finished to write and we can return the conversation to this function
									case 'QuotationConversationMessage': {
										setWriting(false);

										setLastBotMessage(data.initQuotationConversation);
										obs.unsubscribe();
										break;
									}
									case 'QuotationAvailabilityError': {
										handleQuotationAvailabilityError({
											errorCode: data.initQuotationConversation.errorCode,
											message: data.initQuotationConversation.errorMessage,
										});
										break;
									}
								}
							},
						});
				});
			} catch (e) {
				setLoading(false);
				setWriting(false);
				setThinking(false);

				setError(t('errors.unexpected'));

				console.log(e);
			}
		},
		[quotationHash, t],
	);

	const getConversation: UseWidget['getConversation'] = useCallback(async () => {
		setLoading(true);
		try {
			const { data } = await apiClient.query<
				QuotationConversationQuery,
				QuotationConversationQueryVariables
			>({
				query: GET_QUOTATION_CONVERSATION,
				variables: {
					quotationConversationId: conversationId.current!,
				},
			});

			if (data.quotationConversation?.__typename === 'QuotationConversation') {
				setConversation(data.quotationConversation!);
				// We also set quotation here because if user refresh the conversation
				// the conversation will be set as null, and will loose the config
				setQuotation(data.quotationConversation!.quotation!);
				setMessages(conversationToMessages(data.quotationConversation!));

				return data.quotationConversation!;
			} else if (
				data.quotationConversation?.__typename === 'QuotationAvailabilityError'
			) {
				setError(t('errors.quotationNotFoundAfterCreateConversation'));
			}
		} catch (e) {
			console.log(e);
		} finally {
			setLoading(false);
		}
	}, [t]);

	const sendMessage: UseWidget['sendMessage'] = useCallback(
		async (content) => {
			return new Promise(async (res) => {
				setThinking(true);
				setWriting(true);

				pushNewMessage({
					role: QuotationMessageRole.Customer,
					content,
					sent_at: new Date().toISOString(),
				});

				let isFirstToken = true;

				try {
					const obs = apiClient
						.subscribe<
							SendQuotationConversationMessageSubscription,
							SendQuotationConversationMessageSubscriptionVariables
						>({
							query: SEND_QUOTATION_MESSAGE,
							variables: {
								input: {
									conversationId: conversationId.current!,
									message: content,
								},
							},
						})
						.subscribe({
							next(value) {
								if (
									value.data?.sendQuotationConversationMessage?.__typename ===
									'QuotationConversationMessage'
								) {
									setWriting(false);
									setLastBotMessage(value.data.sendQuotationConversationMessage);
									res(value.data.sendQuotationConversationMessage);
									obs.unsubscribe();

									if (value.data.sendQuotationConversationMessage.is_ending_message) {
										setConversation((prev) => {
											const clone = { ...prev! };
											clone.status = QuotationConversationStatus.Finished;
											return clone;
										});
									}
								} else if (
									value.data?.sendQuotationConversationMessage?.__typename ===
									'QuotationConversationMessageToken'
								) {
									if (isFirstToken) {
										isFirstToken = false;
										setThinking(false);
									}

									pushResponseMessagePiece(
										value.data.sendQuotationConversationMessage.token,
									);
								}
							},
						});
				} catch (e) {
					console.log(e);
					setThinking(false);
					setWriting(false);
				}
			});
		},
		[pushNewMessage, pushResponseMessagePiece],
	);

	const handleQuotationAvailabilityError = useCallback(
		(data: QuotationAvailabilityError) => {
			const fn = getHandleQuotationAvailabilityError(t);

			setError(fn(data));
		},
		[t],
	);

	useEffect(() => {
		if (!quotationHash?.trim()) return;

		const storedConversationId = getConversationId(quotationHash);

		if (storedConversationId) {
			conversationId.current = storedConversationId;
			getConversation();
			return;
		}

		// We only need to query quotation when we will start a conversation. So we can fetch the config
		// and then when the user fulfill the identify form, it will start the conversation.
		// At cases that we already have a conversationId, we don't need to fetch the quotation again
		// because it will be fetched together with the conversation.

		// update: now we fetch from server, so we dont need to fetch again
		// findQuotation(initialQuotation);
	}, [quotationHash]);

	const config = (conversation?.quotation || quotation)?.widget_config;
	// Check allowed domain
	useEffect(() => {
		if (!document.referrer || !config) return;

		const isAllowed = !!config?.allowed_domains?.find((item) => {
			// Will always be a valid url
			const referrerUrl = new URL(document.referrer);

			try {
				// May not be a valid url
				const itemUrl = new URL(item);

				return itemUrl.host === referrerUrl.host;
			} catch {
				// We assume it is a domain
				return item === referrerUrl.host;
			}
		});

		if (!isAllowed) {
			setError(t('errors.domainNotAllowed'));
		}
	}, [config, t]);

	const shouldRequireIdentify = useMemo(() => {
		if (!conversation) return false;
		if (!conversation.recipient) return true;

		for (const value of Object.values(conversation.recipient)) {
			if (value === null || value === undefined) return true;
		}

		return false;
	}, [conversation]);

	const identifyUser = useCallback<UseWidget['identifyUser']>(
		async (input) => {
			const [firstName, ...rest] = input.name.split(' ');

			const { data } = await apiClient.mutate<
				UpdateQuotationConversationRecipientMutation,
				UpdateQuotationConversationRecipientMutationVariables
			>({
				mutation: UPDATE_QUOTATION_CONVERSATION_RECIPIENT,
				variables: {
					quotationConversationId: conversationId.current!,
					recipient: {
						first_name: firstName,
						last_name: rest.join(' '),
						email: input.email,
						phone: input.phone,
					},
				},
			});

			if (data?.updateQuotationConversationRecipient) {
				setConversation((prev) => {
					const clone = Object.assign({}, prev);

					clone.recipient = data.updateQuotationConversationRecipient!;

					return clone;
				});
			}
		},
		[setConversation],
	);

	const onRefresh = useCallback(async () => {
		setConversation(null);
		deleteConversationId(quotationHash);

		try {
			setLoading(true);
			setRefreshLoading(true);

			await initConversation(
				quotationHash,
				conversation?.recipient
					? {
							email: conversation.recipient.email!,
							first_name: conversation.recipient.first_name!,
							last_name: conversation.recipient.last_name!,
							phone: conversation.recipient.phone,
					  }
					: undefined,
			);
		} catch (e) {
			console.log(e);
		} finally {
			setRefreshLoading(false);
			setLoading(false);
		}
	}, [quotationHash, conversation]);

	return {
		getConversation,
		initConversation,
		sendMessage,
		conversation,
		quotation,
		messages,

		isLoading,
		isThinking,
		isWriting,

		isRefreshLoading,
		onRefresh,

		error,

		shouldRequireIdentify,
		identifyUser,
	};
};
