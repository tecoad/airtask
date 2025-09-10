import { UnauthorizedException } from '@nestjs/common';
import { quotation, user } from '@prisma/client';
import * as path from 'path';
import { UserNotAAccountMemberError } from 'src/shared/errors';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { mockWidgetConfigInput } from 'test/mocks/entities/widget-config';
import { UPLOAD_FILE } from 'test/shared/gql/private/file';
import {
	ACCOUNT_WIDGET_SETTINGS,
	UPDATE_ACCOUNT_WIDGET_SETTINGS,
} from 'test/shared/gql/private/settings';
import { QUOTATION_WIDGET_SETTINGS } from 'test/shared/gql/public/settings';
import {
	AccountWidgetSettingsQuery,
	AccountWidgetSettingsQueryVariables,
	UpdateAccountWidgetConfigMutation,
	UpdateAccountWidgetConfigMutationVariables,
	UploadFileMutation,
	WidgetConfigFragment,
} from 'test/shared/test-gql-private-api-schema.ts';
import {
	QuotationWidgetSettingsQuery,
	QuotationWidgetSettingsQueryVariables,
} from 'test/shared/test-gql-public-api-schema';
import { createQuotationForAccount } from 'test/shared/utils/create-quotation-for-account';
import { createUserAsAccountMember } from 'test/shared/utils/create-user-as-account-member';
import { UserWithAccounts } from 'test/shared/utils/create-user-as-account-owner';
import { createUserWithoutAccount } from 'test/shared/utils/create-user-without-account';

jest.setTimeout(30000);

describe('Account Widget Settings', () => {
	let userIntoAccount: UserWithAccounts,
		userWithoutAccount: user,
		accountQuotation: quotation,
		environment: TestEnvironment;
	let accountId: number;

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		userIntoAccount = await createUserAsAccountMember(environment, {
			accountInput: {},
		});
		userWithoutAccount = await createUserWithoutAccount(environment);

		accountId = userIntoAccount.account_user[0].account_id!;

		accountQuotation = await createQuotationForAccount(environment, {
			accountId,
		});
	});

	afterAll(async () => {
		await environment.close();
	});

	it('fetch config throws for unauthenticated user', async () => {
		await expect(
			environment.privateApiClient.query<
				AccountWidgetSettingsQuery,
				AccountWidgetSettingsQueryVariables
			>(ACCOUNT_WIDGET_SETTINGS, {
				accountId,
			}),
		).rejects.toThrowError(new UnauthorizedException().message);
	});

	it('throws trying to access a config from account that you are not a member', async () => {
		environment.privateApiClient.authenticateAsUser(
			userWithoutAccount.id,
			userWithoutAccount.email,
		);

		await expect(
			environment.privateApiClient.query<
				AccountWidgetSettingsQuery,
				AccountWidgetSettingsQueryVariables
			>(ACCOUNT_WIDGET_SETTINGS, {
				accountId,
			}),
		).rejects.toThrowError(new UserNotAAccountMemberError().message);
	});

	it('find null config for account', async () => {
		environment.privateApiClient.authenticateAsUser(
			userIntoAccount.id,
			userIntoAccount.email,
		);

		const { data } = await environment.privateApiClient.query<
			AccountWidgetSettingsQuery,
			AccountWidgetSettingsQueryVariables
		>(ACCOUNT_WIDGET_SETTINGS, {
			accountId,
		});

		expect(data.accountWidgetSettings).toBeNull();
	});

	it('update config for account throws for unauthenticated user', async () => {
		environment.privateApiClient.deleteAuthorizationToken();

		await expect(
			environment.privateApiClient.query<
				UpdateAccountWidgetConfigMutation,
				UpdateAccountWidgetConfigMutationVariables
			>(UPDATE_ACCOUNT_WIDGET_SETTINGS, {
				input: {},
				accountId: accountId,
			}),
		).rejects.toThrowError(new UnauthorizedException().message);
	});

	it('update config throws for account that you are not a member', async () => {
		environment.privateApiClient.authenticateAsUser(
			userWithoutAccount.id,
			userWithoutAccount.email,
		);

		await expect(
			environment.privateApiClient.query<
				UpdateAccountWidgetConfigMutation,
				UpdateAccountWidgetConfigMutationVariables
			>(UPDATE_ACCOUNT_WIDGET_SETTINGS, {
				input: {},
				accountId: accountId,
			}),
		).rejects.toThrowError(new UserNotAAccountMemberError().message);
	});

	let configFragmentAfterUpdate: WidgetConfigFragment;

	it('update config for account', async () => {
		environment.privateApiClient.authenticateAsUser(
			userIntoAccount.id,
			userIntoAccount.email,
		);

		const avatar = await environment.privateApiClient.uploadFile<UploadFileMutation>(
				UPLOAD_FILE,
				path.join(process.cwd(), 'test', 'mocks', 'image-example.png'),
			),
			icon = await environment.privateApiClient.uploadFile<UploadFileMutation>(
				UPLOAD_FILE,
				path.join(process.cwd(), 'test', 'mocks', 'image-example.png'),
			);

		const inputConfig = mockWidgetConfigInput({
			avatar: avatar.data.uploadFile[0].id as string,
			icon: icon.data.uploadFile[0].id as string,
		});

		const { data } = await environment.privateApiClient.query<
			UpdateAccountWidgetConfigMutation,
			UpdateAccountWidgetConfigMutationVariables
		>(UPDATE_ACCOUNT_WIDGET_SETTINGS, {
			input: {
				...inputConfig,
			},
			accountId: accountId,
		});

		expect(data.updateAccountWidgetConfig).toEqual({
			...inputConfig,
			icon: {
				id: icon.data.uploadFile[0].id,
				url: icon.data.uploadFile[0].url,
			},
			avatar: {
				id: avatar.data.uploadFile[0].id,
				url: avatar.data.uploadFile[0].url,
			},
		} as WidgetConfigFragment);

		configFragmentAfterUpdate = data.updateAccountWidgetConfig!;
	});

	it('find config for account after update', async () => {
		const { data } = await environment.privateApiClient.query<
			AccountWidgetSettingsQuery,
			AccountWidgetSettingsQueryVariables
		>(ACCOUNT_WIDGET_SETTINGS, {
			accountId,
		});

		expect(data.accountWidgetSettings).toEqual(configFragmentAfterUpdate);
	});

	// Here we test the public api side
	it('see config for account from public api with an account quotation hash', async () => {
		const { data } = await environment.publicApiClient.query<
			QuotationWidgetSettingsQuery,
			QuotationWidgetSettingsQueryVariables
		>(QUOTATION_WIDGET_SETTINGS, {
			hash: accountQuotation.hash,
		});

		expect(data.quotationWidgetSettings).toEqual(configFragmentAfterUpdate);
	});

	// Here we test the public api side
	it('see config for account from public api with an account quotation id', async () => {
		const { data } = await environment.publicApiClient.query<
			QuotationWidgetSettingsQuery,
			QuotationWidgetSettingsQueryVariables
		>(QUOTATION_WIDGET_SETTINGS, {
			id: accountQuotation.id,
		});

		expect(data.quotationWidgetSettings).toEqual(configFragmentAfterUpdate);
	});
});
