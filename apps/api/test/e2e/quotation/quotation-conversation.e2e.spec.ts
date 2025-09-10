import { quotation } from '@prisma/client';
import { sanitizeEmail, sanitizeName } from 'src/modules/users/utils/sanitize';
import { QuotationStatus } from 'src/shared/types/db';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { mockQuotationConversation } from 'test/mocks/entities/quotation';
import { mockOpenAiChatWithStream } from 'test/mocks/services/openai';
import {
	GET_QUOTATION_CONVERSATION,
	INIT_QUOTATION_CONVERSATION,
	SEND_QUOTATION_MESSAGE,
	UPDATE_QUOTATION_CONVERSATION_RECIPIENT,
} from 'test/shared/gql/public/quotation';
import {
	ConversationRecipientFragment,
	InitQuotationConversationSubscription,
	InitQuotationConversationSubscriptionVariables,
	QuotationConversationFragment,
	QuotationConversationMessageFragment,
	QuotationConversationMessageToken,
	QuotationConversationQuery,
	QuotationConversationQueryVariables,
	QuotationConversationStatus,
	QuotationMessageRole,
	SendQuotationConversationMessageSubscription,
	SendQuotationConversationMessageSubscriptionVariables,
	UpdateQuotationConversationRecipientMutation,
	UpdateQuotationConversationRecipientMutationVariables,
} from 'test/shared/test-gql-public-api-schema';
import { createAccountWithSubscription } from 'test/shared/utils/create-account-with-subscription';
import { createQuotationForAccount } from 'test/shared/utils/create-quotation-for-account';

jest.setTimeout(30000);

describe('Quotation Conversation', () => {
	let environment: TestEnvironment;
	let quotation: quotation;

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		const { account } = await createAccountWithSubscription(environment);

		quotation = await createQuotationForAccount(environment, {
			accountId: account.id,
			quotationInput: {
				status: QuotationStatus.Published,
			},
		});
	});

	afterAll(async () => {
		await environment.close();
	});

	let conversationFragment: QuotationConversationFragment;

	it('init conversation', async () => {
		const {
			recipient_email,
			recipient_first_name,
			recipient_last_name,
			recipient_phone,
		} = mockQuotationConversation();

		const completeMessage = mockOpenAiChatWithStream([
			'Hello',
			'this is',
			'the first message',
		]);

		return new Promise((resolve) => {
			const variables: InitQuotationConversationSubscriptionVariables = {
				hash: quotation.hash,
				recipient: {
					email: sanitizeEmail(recipient_email!),
					first_name: sanitizeName(recipient_first_name!),
					last_name: sanitizeName(recipient_last_name!),
					phone: recipient_phone,
				},
			};
			const obs = environment.publicApiClient.wsClient.request({
				query: INIT_QUOTATION_CONVERSATION,
				variables,
			});

			let nextCalls = 0;

			obs.subscribe({
				next({ data }: { data: InitQuotationConversationSubscription }) {
					nextCalls++;

					// First return is the conversation
					if (nextCalls === 1) {
						expect(data.initQuotationConversation).toEqual(<
							QuotationConversationFragment
						>{
							id: expect.any(String),
							status: QuotationConversationStatus.Active,
							message: [],
							recipient: {
								email: sanitizeEmail(recipient_email!),
								first_name: sanitizeName(recipient_first_name!),
								last_name: sanitizeName(recipient_last_name!),
								phone: recipient_phone,
							},
							quotation: {
								hash: quotation.hash,
								title: quotation.title,
								widget_config: null,
							},
							__typename: 'QuotationConversation',
						});

						delete (data.initQuotationConversation as any).__typename;

						// Will be used at next tests
						conversationFragment =
							data.initQuotationConversation as QuotationConversationFragment;
						// We mocked 3 tokens, so we expect the next 3 calls as tokens
					} else if ([2, 3, 4].includes(nextCalls)) {
						expect(data.initQuotationConversation).toEqual({
							token:
								nextCalls === 2
									? 'Hello'
									: nextCalls === 3
									  ? 'this is'
									  : 'the first message',
							__typename: 'QuotationConversationMessageToken',
						} as QuotationConversationMessageToken);
						// Then the message ends and we expect the complete message
					} else if (nextCalls === 5) {
						expect(data.initQuotationConversation).toEqual({
							content: completeMessage,
							role: QuotationMessageRole.Agent,
							sent_at: expect.any(String),
							is_ending_message: null,
							__typename: 'QuotationConversationMessage',
						} as QuotationConversationMessageFragment);

						// Remove __typename to compare later
						delete (data.initQuotationConversation as any).__typename;

						// Update conversationFragment with the message
						conversationFragment.message.push(
							data.initQuotationConversation as QuotationConversationMessageFragment,
						);

						// Resolve test
						resolve(true);
					}
				},
			});
		});
	});

	it('find conversation by id', async () => {
		const { data } = await environment.publicApiClient.query<
			QuotationConversationQuery,
			QuotationConversationQueryVariables
		>(GET_QUOTATION_CONVERSATION, {
			quotationConversationId: conversationFragment.id,
		});

		expect(data.quotationConversation).toEqual(conversationFragment);
	});

	it('update quotation conversation recipient', async () => {
		const {
			recipient_email,
			recipient_first_name,
			recipient_last_name,
			recipient_phone,
		} = mockQuotationConversation();
		const { data } = await environment.publicApiClient.query<
			UpdateQuotationConversationRecipientMutation,
			UpdateQuotationConversationRecipientMutationVariables
		>(UPDATE_QUOTATION_CONVERSATION_RECIPIENT, {
			quotationConversationId: conversationFragment.id,
			recipient: {
				email: sanitizeEmail(recipient_email!),
				first_name: sanitizeName(recipient_first_name!),
				last_name: sanitizeName(recipient_last_name!),
				phone: recipient_phone,
			},
		});

		expect(data.updateQuotationConversationRecipient).toEqual({
			email: sanitizeEmail(recipient_email!),
			first_name: sanitizeName(recipient_first_name!),
			last_name: sanitizeName(recipient_last_name!),
			phone: recipient_phone,
		} as ConversationRecipientFragment);

		// Update conversationFragment with the recipient
		conversationFragment.recipient = data.updateQuotationConversationRecipient;
	});

	it('send conversation message', async () => {
		const completeMessage = mockOpenAiChatWithStream(['My', 'reply', 'for user']);

		return new Promise((resolve) => {
			const variables: SendQuotationConversationMessageSubscriptionVariables = {
				input: {
					conversationId: conversationFragment.id,
					message: 'User input',
				},
			};
			const obs = environment.publicApiClient.wsClient.request({
				query: SEND_QUOTATION_MESSAGE,
				variables,
			});

			let nextCalls = 0;

			obs.subscribe({
				next({ data }: { data: SendQuotationConversationMessageSubscription }) {
					nextCalls++;

					// First 3 returns is the tokens of reply
					if ([1, 2, 3].includes(nextCalls)) {
						expect(data.sendQuotationConversationMessage).toEqual({
							token: nextCalls === 1 ? 'My' : nextCalls === 2 ? 'reply' : 'for user',
							__typename: 'QuotationConversationMessageToken',
						} as QuotationConversationMessageToken);
					} else if (nextCalls === 4) {
						expect(data.sendQuotationConversationMessage).toEqual({
							content: completeMessage,
							role: QuotationMessageRole.Agent,
							sent_at: expect.any(String),
							is_ending_message: null,
							__typename: 'QuotationConversationMessage',
						} as QuotationConversationMessageFragment);

						// Remove __typename to compare later
						delete (data.sendQuotationConversationMessage as any).__typename;

						// Update conversationFragment with the message
						conversationFragment.message.push(
							data.sendQuotationConversationMessage as QuotationConversationMessageFragment,
						);

						// Resolve test
						resolve(true);
					}
				},
			});
		});
	});

	it('find conversation after update recipient and send a message', async () => {
		const { data } = await environment.publicApiClient.query<
			QuotationConversationQuery,
			QuotationConversationQueryVariables
		>(GET_QUOTATION_CONVERSATION, {
			quotationConversationId: conversationFragment.id,
		});

		expect(data.quotationConversation).toEqual({
			...conversationFragment,
			message: [
				// The bot init message
				conversationFragment.message[0],
				// The user input saved at the database
				// NOTE: Because we can't construct this object from our side and push such as we do
				// with the bot reply message, we need to assert this object manually.
				// After that, we can assign this return to 'conversationFragment' and use it at next tests
				expect.objectContaining({
					content: 'User input',
					role: QuotationMessageRole.Customer,
					sent_at: expect.any(String),
					is_ending_message: null,
				} as QuotationConversationMessageFragment),
				// The bot reply message (index 1 because the user input isn't at this array yet)
				conversationFragment.message[1],
			],
		});

		// Update conversationFragment with the message
		conversationFragment = data.quotationConversation as QuotationConversationFragment;
	});

	it('send the last user message at conversation', async () => {
		// We need to get conversation.code because the AI is instructed to return it at the end of the conversation
		const conversationAtDb =
			await environment.prisma.quotation_conversation.findUniqueOrThrow({
				where: {
					id: Number(conversationFragment.id),
				},
			});
		const completeMessage = mockOpenAiChatWithStream([
			'End',
			'of the conversation',
			`the code is ${conversationAtDb.code}`,
		]);

		return new Promise((resolve) => {
			const variables: SendQuotationConversationMessageSubscriptionVariables = {
				input: {
					conversationId: conversationFragment.id,
					message: 'User input',
				},
			};
			const obs = environment.publicApiClient.wsClient.request({
				query: SEND_QUOTATION_MESSAGE,
				variables,
			});

			let nextCalls = 0;

			obs.subscribe({
				next({ data }: { data: SendQuotationConversationMessageSubscription }) {
					nextCalls++;

					// Not really care about the tokens at this test
					if (nextCalls === 4) {
						expect(data.sendQuotationConversationMessage).toEqual({
							content: completeMessage,
							role: QuotationMessageRole.Agent,
							sent_at: expect.any(String),
							// The last message is the ending message
							is_ending_message: true,
							__typename: 'QuotationConversationMessage',
						} as QuotationConversationMessageFragment);

						// Remove __typename to compare later
						delete (data.sendQuotationConversationMessage as any).__typename;

						// Update conversationFragment with the message
						conversationFragment.message.push(
							data.sendQuotationConversationMessage as QuotationConversationMessageFragment,
						);

						// Resolve test
						resolve(true);
					}
				},
			});
		});
	});

	it('find conversation with finished status after send last message', async () => {
		const { data } = await environment.publicApiClient.query<
			QuotationConversationQuery,
			QuotationConversationQueryVariables
		>(GET_QUOTATION_CONVERSATION, {
			quotationConversationId: conversationFragment.id,
		});

		// We already testes that the recipient and the first message is correct
		// so here we just need the assert that the status is finished
		expect((data.quotationConversation as QuotationConversationFragment).status).toBe(
			QuotationConversationStatus.Finished,
		);
	});
});
