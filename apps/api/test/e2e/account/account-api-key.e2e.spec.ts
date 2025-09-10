import { UnauthorizedException } from '@nestjs/common';
import { AccountRole, AccountUsageKind } from 'src/graphql';
import { UserNotAccountManagerError } from 'src/shared/errors';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import {
	ACCOUNT_API_KEYS,
	CREATE_ACCOUNT_API_KEY,
	DELETE_ACCOUNT_API_KEY,
} from 'test/shared/gql/private/account-api-key';
import {
	AccountApiKeyFragment,
	AccountApiKeysQuery,
	AccountApiKeysQueryVariables,
	CreateAccountApiKeyMutation,
	CreateAccountApiKeyMutationVariables,
	DeleteAccountApiKeyMutation,
	DeleteAccountApiKeyMutationVariables,
} from 'test/shared/test-gql-private-api-schema.ts';
import { UserWithAccounts } from 'test/shared/utils/create-user-as-account-owner';
import { createUserAsAccountMemberWithSubscription } from 'test/shared/utils/create-user-as-account-with-subscription-member';

describe('Account Api Key', () => {
	let environment: TestEnvironment,
		userAccountOwner: UserWithAccounts,
		accountId: number,
		userIntoAnotherAccount: UserWithAccounts,
		anotherAccountId: number;

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		userAccountOwner = await createUserAsAccountMemberWithSubscription(environment, {
			accountUserInput: {
				role: AccountRole.owner,
			},
			subscriptionInput: {},
			subscriptionPlanInput: {
				name: 'Plan',
				allowed_modules: [AccountUsageKind.flow],
			},
		});

		accountId = userAccountOwner.account_user[0].account_id!;

		userIntoAnotherAccount = await createUserAsAccountMemberWithSubscription(
			environment,
			{
				accountUserInput: {
					role: AccountRole.owner,
				},
				subscriptionInput: {},
				subscriptionPlanInput: {
					name: 'Plan',
					allowed_modules: [AccountUsageKind.flow],
				},
			},
		);
		anotherAccountId = userIntoAnotherAccount.account_user[0].account_id!;
	});

	afterAll(async () => {
		await environment.close();
	});

	let createdItem: AccountApiKeyFragment;

	describe('Create', () => {
		it('cant create without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<
					CreateAccountApiKeyMutation,
					CreateAccountApiKeyMutationVariables
				>(CREATE_ACCOUNT_API_KEY, {
					input: {
						accountId: accountId,
						name: 'Test',
					},
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant create without been account member', async () => {
			environment.privateApiClient.authenticateAsUser(
				userIntoAnotherAccount.id,
				userIntoAnotherAccount.email,
			);

			await expect(
				environment.privateApiClient.query<
					CreateAccountApiKeyMutation,
					CreateAccountApiKeyMutationVariables
				>(CREATE_ACCOUNT_API_KEY, {
					input: {
						accountId: accountId,
						name: 'Test',
					},
				}),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('create api key and see the token', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			const { data } = await environment.privateApiClient.query<
				CreateAccountApiKeyMutation,
				CreateAccountApiKeyMutationVariables
			>(CREATE_ACCOUNT_API_KEY, {
				input: {
					accountId: accountId,
					name: 'Test',
				},
			});

			expect(data.createAccountApiKey).toEqual(<AccountApiKeyFragment>{
				id: expect.any(String),
				date_created: expect.any(String),
				maskedToken: expect.any(String),
				date_updated: null,
				name: 'Test',
				token: expect.any(String),
			});

			createdItem = data.createAccountApiKey;
		});
	});

	describe('List', () => {
		it('cant list without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<
					AccountApiKeysQuery,
					AccountApiKeysQueryVariables
				>(ACCOUNT_API_KEYS, {
					accountId,
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant list without been account member', async () => {
			environment.privateApiClient.authenticateAsUser(
				userIntoAnotherAccount.id,
				userIntoAnotherAccount.email,
			);

			await expect(
				environment.privateApiClient.query<
					AccountApiKeysQuery,
					AccountApiKeysQueryVariables
				>(ACCOUNT_API_KEYS, {
					accountId,
				}),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('list and only see masked token', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			const { data } = await environment.privateApiClient.query<
				AccountApiKeysQuery,
				AccountApiKeysQueryVariables
			>(ACCOUNT_API_KEYS, {
				accountId,
			});

			expect(data.accountApiKeys).toEqual(<AccountApiKeyFragment[]>[
				{
					...createdItem,
					token: null,
					maskedToken: `****${createdItem.token!.slice(-4)}`,
				},
			]);
		});
	});

	describe('Delete', () => {
		it('cant delete without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<
					DeleteAccountApiKeyMutation,
					DeleteAccountApiKeyMutationVariables
				>(DELETE_ACCOUNT_API_KEY, {
					deleteAccountApiKeyId: createdItem.id,
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant list without been account member', async () => {
			environment.privateApiClient.authenticateAsUser(
				userIntoAnotherAccount.id,
				userIntoAnotherAccount.email,
			);

			await expect(
				environment.privateApiClient.query<
					DeleteAccountApiKeyMutation,
					DeleteAccountApiKeyMutationVariables
				>(DELETE_ACCOUNT_API_KEY, {
					deleteAccountApiKeyId: createdItem.id,
				}),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('delete', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			const { data: result } = await environment.privateApiClient.query<
				DeleteAccountApiKeyMutation,
				DeleteAccountApiKeyMutationVariables
			>(DELETE_ACCOUNT_API_KEY, {
				deleteAccountApiKeyId: createdItem.id,
			});
			expect(result.deleteAccountApiKey).toBe(true);

			const { data } = await environment.privateApiClient.query<
				AccountApiKeysQuery,
				AccountApiKeysQueryVariables
			>(ACCOUNT_API_KEYS, {
				accountId,
			});

			expect(data.accountApiKeys).toEqual(<AccountApiKeyFragment[]>[]);
		});
	});
});
