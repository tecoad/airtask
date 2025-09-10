import { UnauthorizedException } from '@nestjs/common';
import { user } from '@prisma/client';
import { UserNotAAccountMemberError } from 'src/shared/errors/user-not-a-account-member.error';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { mockAccount } from 'test/mocks/entities/account';
import { QUERY_ACCOUNT } from 'test/shared/gql/private/account';
import {
	AccountFragment,
	AccountQuery,
	AccountQueryVariables,
	AccountRole,
	AccountSettingsQueryVariables,
} from 'test/shared/test-gql-private-api-schema.ts';
import {
	UserWithAccounts,
	createUserAsAccountOwner,
} from 'test/shared/utils/create-user-as-account-owner';
import { createUserWithoutAccount } from 'test/shared/utils/create-user-without-account';

jest.setTimeout(30000);

describe('Account Settings', () => {
	let userWithoutAccount: user,
		userIntoAccount: UserWithAccounts,
		environment: TestEnvironment;

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		const { name, website, description, currency } = mockAccount();

		userWithoutAccount = await createUserWithoutAccount(environment);
		userIntoAccount = await createUserAsAccountOwner(environment, {
			accountInput: {
				name,
				website,
				description,
				currency,
			},
		});
	});

	afterAll(async () => {
		await environment.close();
	});

	it('account query throws error if user is not authenticated', async () => {
		const account = userIntoAccount.account_user[0].account!;
		await expect(
			environment.privateApiClient.query<AccountQuery, AccountQueryVariables>(
				QUERY_ACCOUNT,
				{
					accountId: account.id,
				},
			),
		).rejects.toThrowError(new UnauthorizedException().message);
	});

	it('account query throws error if user is not a member of account', async () => {
		// Authenticate for next with
		environment.privateApiClient.authenticateAsUser(
			userWithoutAccount.id,
			userWithoutAccount.email,
		);
		const account = userIntoAccount.account_user[0].account!;
		await expect(
			environment.privateApiClient.query<AccountQuery, AccountSettingsQueryVariables>(
				QUERY_ACCOUNT,
				{
					accountId: account.id,
				},
			),
		).rejects.toThrowError(new UserNotAAccountMemberError());
	});

	it('query account', async () => {
		// Authenticate for next with
		environment.privateApiClient.authenticateAsUser(
			userIntoAccount.id,
			userIntoAccount.email,
		);

		const account = userIntoAccount.account_user[0].account!;
		const { data } = await environment.privateApiClient.query<
			AccountQuery,
			AccountQueryVariables
		>(QUERY_ACCOUNT, {
			accountId: account.id,
		});

		expect(data.account).toEqual({
			id: account.id.toString(),
			name: account.name,
			segment: null,
			description: account.description,
			website: account.website,
			currency: account.currency,
			concluded_onboarding_steps: [],
			users: [
				{
					account_id: account.id.toString(),
					user_id: userIntoAccount.id.toString(),
					role: AccountRole.Owner,
					user: {
						id: userIntoAccount.id.toString(),
						email: userIntoAccount.email,
						first_name: userIntoAccount.first_name,
						last_name: userIntoAccount.last_name,
					},
				},
			],
		} as AccountFragment);
	});
});
