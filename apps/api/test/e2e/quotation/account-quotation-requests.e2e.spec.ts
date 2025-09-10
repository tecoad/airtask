import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { Prisma, quotation, quotation_conversation } from '@prisma/client';
import { AccountQuotationsRequestsService } from 'src/modules/quotations/services/account-quotations-requests.service';
import { QuotationRequestData } from 'src/modules/quotations/types';
import { UserNotAAccountMemberError } from 'src/shared/errors';
import { UnwrapPromise } from 'src/shared/utils/generics';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import {
	QUOTATION_REQUEST,
	QUOTATION_REQUESTS,
	TOGGLE_QUOTATION_REQUEST_CHECK,
	VISUALIZE_QUOTATION_REQUEST,
} from 'test/shared/gql/private/quotation-request';
import {
	AccountQuotationRequestQuery,
	AccountQuotationRequestQueryVariables,
	AccountQuotationRequestsQuery,
	AccountQuotationRequestsQueryVariables,
	FilterOperator,
	QuotationRequestFragment,
	SortOrder,
	ToggleQuotationRequestCheckMutation,
	ToggleQuotationRequestCheckMutationVariables,
	UserFragment,
	VisualizeQuotationRequestMutation,
	VisualizeQuotationRequestMutationVariables,
} from 'test/shared/test-gql-private-api-schema.ts';
import { createQuotationForAccount } from 'test/shared/utils/create-quotation-for-account';
import { UserWithAccounts } from 'test/shared/utils/create-user-as-account-owner';
import { createUserAsAccountMemberWithSubscription } from 'test/shared/utils/create-user-as-account-with-subscription-member';
import { v4 } from 'uuid';

jest.setTimeout(30000);

describe('AccountQuotationRequests', () => {
	let environment: TestEnvironment;
	let mainUser: UserWithAccounts,
		userIntoAnotherAccount: UserWithAccounts,
		accountQuotation: quotation,
		secondAccountQuotation: quotation;

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		mainUser = await createUserAsAccountMemberWithSubscription(environment);
		userIntoAnotherAccount = await createUserAsAccountMemberWithSubscription(environment);

		accountQuotation = await createQuotationForAccount(environment, {
			accountId: mainUser.account_user[0].account_id!,
		});
		secondAccountQuotation = await createQuotationForAccount(environment, {
			accountId: mainUser.account_user[0].account_id!,
		});
	});

	afterAll(async () => {
		await environment.close();
	});

	const getUtils = () => {
		const mockConversation = () => {
			const conversation = {
				recipient_email: faker.internet.email(),
				recipient_first_name: faker.name.firstName(),
				recipient_last_name: faker.name.lastName(),
				recipient_phone: faker.phone.number(),
			} satisfies Partial<quotation_conversation>;

			return conversation;
		};

		const createRequest = async (
			quotationId: string,
			extra?: Partial<Prisma.quotation_requestCreateInput>,
		) => {
			const sequentialId = await environment.app
				.get(AccountQuotationsRequestsService)
				.generateQuotationSequentialId(environment.prisma, quotationId);

			return environment.prisma.quotation_request.create({
				data: {
					id: v4(),
					sequential_id: sequentialId,
					request_data: {
						Question01: 'Answer01',
					} as QuotationRequestData,
					account_quotation_request_accountToaccount: {
						connect: {
							id: mainUser.account_user[0].account_id!,
						},
					},
					quotation_quotation_request_quotationToquotation: {
						connect: {
							id: quotationId,
						},
					},
					quotation_conversation_quotation_request_quotation_conversationToquotation_conversation:
						{
							create: {
								quotation: accountQuotation.id,
								...mockConversation(),
							},
						},
					...extra,
				},
				include: {
					quotation_conversation_quotation_request_quotation_conversationToquotation_conversation:
						true,
				},
			});
		};

		const conversation = (data: UnwrapPromise<ReturnType<typeof createRequest>>) =>
			data.quotation_conversation_quotation_request_quotation_conversationToquotation_conversation!;

		const resultExpected = (
			request: UnwrapPromise<ReturnType<typeof createRequest>>,
			custom?: Partial<QuotationRequestFragment>,
		): QuotationRequestFragment => {
			return {
				id: expect.any(String),
				sequential_id: expect.any(String),
				conversation: {
					id: conversation(request).id.toString(),
					recipient: {
						email: conversation(request).recipient_email,
						first_name: conversation(request).recipient_first_name,
						last_name: conversation(request).recipient_last_name,
						phone: conversation(request).recipient_phone,
					},
				},
				quotation: expect.objectContaining({
					id: request.quotation?.toString(),
				}),
				date_created: expect.any(String),
				date_updated: null,
				checked_at: null,
				checked_by: null,
				visualized_at: null,
				data: [
					{
						answer: 'Answer01',
						question: 'Question01',
					},
				],
				...custom,
			};
		};

		return { createRequest, conversation, resultExpected };
	};

	type UtilCreatedRequest = UnwrapPromise<
		ReturnType<ReturnType<typeof getUtils>['createRequest']>
	>;

	describe('Quotation Requests Paginated List', () => {
		it('cant query paginated list unauthenticated', async () => {
			await expect(
				environment.privateApiClient.query<
					AccountQuotationRequestsQuery,
					AccountQuotationRequestsQueryVariables
				>(QUOTATION_REQUESTS, {
					accountId: mainUser.account_user[0].account_id!,
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant query paginated list without been a account member', async () => {
			environment.privateApiClient.authenticateAsUser(
				userIntoAnotherAccount.id,
				userIntoAnotherAccount.email,
			);

			await expect(
				environment.privateApiClient.query<
					AccountQuotationRequestsQuery,
					AccountQuotationRequestsQueryVariables
				>(QUOTATION_REQUESTS, {
					accountId: mainUser.account_user[0].account_id!,
				}),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		const firstQuotationCreatedRequests: UtilCreatedRequest[] = [];
		const secondQuotationCreatedRequests: UtilCreatedRequest[] = [];

		it('query paginated list as account member', async () => {
			const { createRequest, resultExpected } = getUtils();

			// create three requests
			const request01 = await createRequest(accountQuotation.id);
			const request02 = await createRequest(accountQuotation.id);
			const request03 = await createRequest(accountQuotation.id);
			firstQuotationCreatedRequests.push(request01, request02, request03);

			environment.privateApiClient.authenticateAsUser(mainUser.id, mainUser.email);

			const { data } = await environment.privateApiClient.query<
				AccountQuotationRequestsQuery,
				AccountQuotationRequestsQueryVariables
			>(QUOTATION_REQUESTS, {
				accountId: mainUser.account_user[0].account_id!,
				pagination: {
					sort: {
						date_created: SortOrder.Asc,
					},
				},
			});

			expect(data.accountQuotationRequests.totalItems).toBe(3);
			expect(data.accountQuotationRequests.items).toHaveLength(3);

			expect(data.accountQuotationRequests.items[0]).toEqual(
				resultExpected(request01, {
					sequential_id: '1',
				}),
			);
			expect(data.accountQuotationRequests.items[1]).toEqual(
				resultExpected(request02, {
					sequential_id: '2',
				}),
			);
			expect(data.accountQuotationRequests.items[2]).toEqual(
				resultExpected(request03, {
					sequential_id: '3',
				}),
			);
		});

		it('filter by quotation id', async () => {
			const { createRequest, resultExpected } = getUtils();
			// create one request for second quotation
			const request01 = await createRequest(secondAccountQuotation.id);
			secondQuotationCreatedRequests.push(request01);

			const { data } = await environment.privateApiClient.query<
				AccountQuotationRequestsQuery,
				AccountQuotationRequestsQueryVariables
			>(QUOTATION_REQUESTS, {
				accountId: mainUser.account_user[0].account_id!,
				filter: {
					operator: FilterOperator.And,
					quotation: secondAccountQuotation.id,
				},
			});

			expect(data.accountQuotationRequests.totalItems).toBe(1);
			expect(data.accountQuotationRequests.items).toHaveLength(1);
			expect(data.accountQuotationRequests.items).toEqual([resultExpected(request01)]);
		});

		it('filter by recipientQuery name', async () => {
			const { conversation, resultExpected } = getUtils();
			const [request01] = firstQuotationCreatedRequests;

			const { data } = await environment.privateApiClient.query<
				AccountQuotationRequestsQuery,
				AccountQuotationRequestsQueryVariables
			>(QUOTATION_REQUESTS, {
				accountId: mainUser.account_user[0].account_id!,
				filter: {
					operator: FilterOperator.And,
					recipientQuery: `${conversation(request01).recipient_first_name} ${conversation(
						request01,
					).recipient_last_name?.slice(0, -2)}`,
				},
			});

			expect(data.accountQuotationRequests.totalItems).toBe(1);
			expect(data.accountQuotationRequests.items).toHaveLength(1);
			expect(data.accountQuotationRequests.items).toEqual([resultExpected(request01)]);
		});

		it('filter by recipientQuery email', async () => {
			const { conversation, resultExpected } = getUtils();
			const [, request02] = firstQuotationCreatedRequests;

			const { data } = await environment.privateApiClient.query<
				AccountQuotationRequestsQuery,
				AccountQuotationRequestsQueryVariables
			>(QUOTATION_REQUESTS, {
				accountId: mainUser.account_user[0].account_id!,
				filter: {
					operator: FilterOperator.And,
					recipientQuery: conversation(request02).recipient_email,
				},
			});

			expect(data.accountQuotationRequests.totalItems).toBe(1);
			expect(data.accountQuotationRequests.items).toHaveLength(1);
			expect(data.accountQuotationRequests.items).toEqual([resultExpected(request02)]);
		});

		it('filter by recipientQuery phone', async () => {
			const { conversation, resultExpected } = getUtils();
			const [, , request03] = firstQuotationCreatedRequests;

			const { data } = await environment.privateApiClient.query<
				AccountQuotationRequestsQuery,
				AccountQuotationRequestsQueryVariables
			>(QUOTATION_REQUESTS, {
				accountId: mainUser.account_user[0].account_id!,
				filter: {
					operator: FilterOperator.And,
					recipientQuery: conversation(request03).recipient_phone,
				},
			});

			expect(data.accountQuotationRequests.totalItems).toBe(1);
			expect(data.accountQuotationRequests.items).toHaveLength(1);
			expect(data.accountQuotationRequests.items).toEqual([resultExpected(request03)]);
		});

		it('filter by is checked', async () => {
			const { resultExpected } = getUtils();
			const [request01] = firstQuotationCreatedRequests;

			await environment.prisma.quotation_request.update({
				where: { id: request01.id },
				data: {
					checked_at: new Date(),
				},
			});

			const { data } = await environment.privateApiClient.query<
				AccountQuotationRequestsQuery,
				AccountQuotationRequestsQueryVariables
			>(QUOTATION_REQUESTS, {
				accountId: mainUser.account_user[0].account_id!,
				filter: {
					operator: FilterOperator.And,
					is_checked: true,
				},
			});

			expect(data.accountQuotationRequests.totalItems).toBe(1);
			expect(data.accountQuotationRequests.items).toHaveLength(1);
			expect(data.accountQuotationRequests.items).toEqual([
				resultExpected(request01, {
					date_updated: expect.anything(),
					checked_at: expect.any(String),
				}),
			]);
		});

		it('filter by is not checked', async () => {
			const [request01] = firstQuotationCreatedRequests;

			const { data } = await environment.privateApiClient.query<
				AccountQuotationRequestsQuery,
				AccountQuotationRequestsQueryVariables
			>(QUOTATION_REQUESTS, {
				accountId: mainUser.account_user[0].account_id!,
				filter: {
					operator: FilterOperator.And,
					is_checked: false,
				},
			});

			expect(data.accountQuotationRequests.totalItems).toBe(3);
			expect(data.accountQuotationRequests.items).toHaveLength(3);
			expect(data.accountQuotationRequests.items).toEqual(
				expect.not.arrayContaining([
					{
						id: request01.id,
					},
				]),
			);
		});

		it('filter operator AND works', async () => {
			const { data } = await environment.privateApiClient.query<
				AccountQuotationRequestsQuery,
				AccountQuotationRequestsQueryVariables
			>(QUOTATION_REQUESTS, {
				accountId: mainUser.account_user[0].account_id!,
				filter: {
					operator: FilterOperator.And,
					is_checked: true,
					quotation: secondAccountQuotation.id,
				},
			});

			expect(data.accountQuotationRequests.totalItems).toBe(0);
			expect(data.accountQuotationRequests.items).toHaveLength(0);
		});

		it('filter operator OR works', async () => {
			const [checked] = firstQuotationCreatedRequests;
			const [secondQuotationRequest] = secondQuotationCreatedRequests;

			const { data } = await environment.privateApiClient.query<
				AccountQuotationRequestsQuery,
				AccountQuotationRequestsQueryVariables
			>(QUOTATION_REQUESTS, {
				accountId: mainUser.account_user[0].account_id!,
				filter: {
					operator: FilterOperator.Or,
					is_checked: true,
					quotation: secondAccountQuotation.id,
				},
			});

			expect(data.accountQuotationRequests.totalItems).toBe(2);
			expect(data.accountQuotationRequests.items).toHaveLength(2);
			expect(data.accountQuotationRequests.items).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						id: checked.id,
					}),
					expect.objectContaining({
						id: secondQuotationRequest.id,
					}),
				]),
			);
		});

		it('paginates with skip and sort asc', async () => {
			const { resultExpected } = getUtils();
			const [, request02, request03] = firstQuotationCreatedRequests;

			const { data } = await environment.privateApiClient.query<
				AccountQuotationRequestsQuery,
				AccountQuotationRequestsQueryVariables
			>(QUOTATION_REQUESTS, {
				accountId: mainUser.account_user[0].account_id!,
				filter: {
					operator: FilterOperator.And,
					quotation: accountQuotation.id,
				},
				pagination: {
					skip: 1,
					sort: {
						date_created: SortOrder.Asc,
					},
				},
			});

			expect(data.accountQuotationRequests.totalItems).toBe(3);
			expect(data.accountQuotationRequests.items).toHaveLength(2);

			expect(data.accountQuotationRequests.items[0]).toEqual(resultExpected(request02));
			expect(data.accountQuotationRequests.items[1]).toEqual(resultExpected(request03));
		});

		it('paginates with take and sort desc', async () => {
			const { resultExpected } = getUtils();
			const [, request02, request03] = firstQuotationCreatedRequests;

			const { data } = await environment.privateApiClient.query<
				AccountQuotationRequestsQuery,
				AccountQuotationRequestsQueryVariables
			>(QUOTATION_REQUESTS, {
				accountId: mainUser.account_user[0].account_id!,
				filter: {
					operator: FilterOperator.And,
					quotation: accountQuotation.id,
				},
				pagination: {
					take: 2,
					sort: {
						date_created: SortOrder.Desc,
					},
				},
			});

			expect(data.accountQuotationRequests.totalItems).toBe(3);
			expect(data.accountQuotationRequests.items).toHaveLength(2);

			expect(data.accountQuotationRequests.items[0]).toEqual(resultExpected(request03));
			expect(data.accountQuotationRequests.items[1]).toEqual(resultExpected(request02));
		});
	});

	describe('Quotation Request single view and actions', () => {
		let request: UtilCreatedRequest;

		it('cant see single quotation request unauthenticated', async () => {
			environment.privateApiClient.deleteAuthorizationToken();
			const { createRequest } = getUtils();
			request = await createRequest(accountQuotation.id);

			await expect(
				environment.privateApiClient.query<
					AccountQuotationRequestQuery,
					AccountQuotationRequestQueryVariables
				>(QUOTATION_REQUEST, {
					quotationId: accountQuotation.id,
					requestSequentialId: request.sequential_id,
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant see single quotation request without been a account member', async () => {
			environment.privateApiClient.authenticateAsUser(
				userIntoAnotherAccount.id,
				userIntoAnotherAccount.email,
			);

			await expect(
				environment.privateApiClient.query<
					AccountQuotationRequestQuery,
					AccountQuotationRequestQueryVariables
				>(QUOTATION_REQUEST, {
					quotationId: accountQuotation.id,
					requestSequentialId: request.sequential_id,
				}),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('see single quotation request', async () => {
			const { resultExpected } = getUtils();
			environment.privateApiClient.authenticateAsUser(mainUser.id, mainUser.email);

			const { data } = await environment.privateApiClient.query<
				AccountQuotationRequestQuery,
				AccountQuotationRequestQueryVariables
			>(QUOTATION_REQUEST, {
				quotationId: accountQuotation.id,
				requestSequentialId: request.sequential_id,
			});

			expect(data.accountQuotationRequest).toEqual(resultExpected(request));
		});

		it('cant check quotation request without been a account member', async () => {
			environment.privateApiClient.authenticateAsUser(
				userIntoAnotherAccount.id,
				userIntoAnotherAccount.email,
			);

			await expect(
				environment.privateApiClient.query<
					ToggleQuotationRequestCheckMutation,
					ToggleQuotationRequestCheckMutationVariables
				>(TOGGLE_QUOTATION_REQUEST_CHECK, {
					requestId: request.id,
				}),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);

			environment.privateApiClient.authenticateAsUser(mainUser.id, mainUser.email);
		});

		it('check quotation request', async () => {
			const { resultExpected } = getUtils();
			const { data } = await environment.privateApiClient.query<
				ToggleQuotationRequestCheckMutation,
				ToggleQuotationRequestCheckMutationVariables
			>(TOGGLE_QUOTATION_REQUEST_CHECK, {
				requestId: request.id,
			});

			expect(data.toggleQuotationRequestCheck).toEqual([
				resultExpected(request, {
					date_updated: expect.any(String),
					visualized_at: expect.any(String),
					checked_at: expect.any(String),
					checked_by: {
						id: mainUser.id.toString(),
						email: mainUser.email,
						first_name: mainUser.first_name,
						last_name: mainUser.last_name,
					} as UserFragment,
				}),
			]);
		});

		it('uncheck quotation request', async () => {
			const { resultExpected } = getUtils();
			const { data } = await environment.privateApiClient.query<
				ToggleQuotationRequestCheckMutation,
				ToggleQuotationRequestCheckMutationVariables
			>(TOGGLE_QUOTATION_REQUEST_CHECK, {
				requestId: request.id,
			});

			expect(data.toggleQuotationRequestCheck).toEqual([
				resultExpected(request, {
					date_updated: expect.any(String),
					visualized_at: expect.any(String),
					checked_at: null,
					checked_by: null,
				}),
			]);
		});

		it('cant view quotation request without been a account member', async () => {
			environment.privateApiClient.authenticateAsUser(
				userIntoAnotherAccount.id,
				userIntoAnotherAccount.email,
			);

			await expect(
				environment.privateApiClient.query<
					AccountQuotationRequestQuery,
					AccountQuotationRequestQueryVariables
				>(QUOTATION_REQUEST, {
					quotationId: accountQuotation.id,
					requestSequentialId: request.sequential_id,
				}),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);

			environment.privateApiClient.authenticateAsUser(mainUser.id, mainUser.email);
		});

		it('view quotation request', async () => {
			// create another that isnt visualized;
			const { createRequest } = getUtils();

			request = await createRequest(accountQuotation.id);

			const { data } = await environment.privateApiClient.query<
				AccountQuotationRequestQuery,
				AccountQuotationRequestQueryVariables
			>(QUOTATION_REQUEST, {
				quotationId: accountQuotation.id,
				requestSequentialId: request.sequential_id,
			});

			expect(data.accountQuotationRequest?.visualized_at).toBeNull();

			const viewRes = await environment.privateApiClient.query<
				VisualizeQuotationRequestMutation,
				VisualizeQuotationRequestMutationVariables
			>(VISUALIZE_QUOTATION_REQUEST, {
				requestId: request.id,
			});

			expect(viewRes.data.visualizeQuotationRequest).toBe(true);

			const afterViewRes = await environment.privateApiClient.query<
				AccountQuotationRequestQuery,
				AccountQuotationRequestQueryVariables
			>(QUOTATION_REQUEST, {
				quotationId: accountQuotation.id,
				requestSequentialId: request.sequential_id,
			});

			expect(afterViewRes.data.accountQuotationRequest?.visualized_at).toEqual(
				expect.any(String),
			);
		});
	});
});
