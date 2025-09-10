import { faker } from '@faker-js/faker';
import { segment } from '@prisma/client';
import { SegmentTranslationAtDb } from 'src/modules/accounts/types';
import {
	setupTestEnvironment,
	TestEnvironment,
} from 'test/config/setup-test-environment';
import { mockAccount } from 'test/mocks/entities/account';
import {
	QUERY_ACCOUNT_SETTINGS,
	UPDATE_ACCOUNT_SETTINGS,
} from 'test/shared/gql/private/account';
import {
	AccountSettingsFragment,
	AccountSettingsQuery,
	AccountSettingsQueryVariables,
	LanguageCode,
	UpdateAccountSettingsMutation,
	UpdateAccountSettingsMutationVariables,
} from 'test/shared/test-gql-private-api-schema.ts';
import {
	createUserAsAccountOwner,
	UserWithAccounts,
} from 'test/shared/utils/create-user-as-account-owner';

jest.setTimeout(30000);

describe('Account Settings', () => {
	let user: UserWithAccounts, environment: TestEnvironment, desiredSegment: segment;

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		const { name, website, description } = mockAccount();

		desiredSegment = await environment.prisma.segment.create({
			data: {
				title: faker.lorem.words(2),
				translations: [
					{
						language: 'en',
						translation: 'segment-en',
					},
				] as SegmentTranslationAtDb,
			},
		});

		user = await createUserAsAccountOwner(environment, {
			accountInput: {
				name,
				website,
				description,
			},
		});

		environment.privateApiClient.authenticateAsUser(user.id, user.email);
	});

	afterAll(async () => {
		await environment.prisma.segment.delete({
			where: {
				title: desiredSegment.title,
			},
		});

		await environment.close();
	});

	it('query account settings', async () => {
		const account = user.account_user[0].account!;
		const { data } = await environment.privateApiClient.query<
			AccountSettingsQuery,
			AccountSettingsQueryVariables
		>(QUERY_ACCOUNT_SETTINGS, {
			accountId: account.id,
		});

		expect(data.account).toEqual({
			id: account.id.toString(),
			name: account.name,
			segment: null,
			description: account.description,
			website: account.website,
		} as AccountSettingsFragment);
	});

	const updateInput = mockAccount();

	it('update account settings', async () => {
		const account = user.account_user[0].account!;
		const { name, website, description } = updateInput;

		const { data } = await environment.privateApiClient.query<
			UpdateAccountSettingsMutation,
			UpdateAccountSettingsMutationVariables
		>(UPDATE_ACCOUNT_SETTINGS, {
			input: {
				id: account.id,
				name,
				website,
				description,
				segment: desiredSegment.id.toString(),
			},
		});

		expect(data.updateAccountSettings).toEqual({
			id: account.id.toString(),
			name,
			segment: {
				id: desiredSegment.id.toString(),
				title: desiredSegment.title,
				translations: [
					{
						language: LanguageCode.En,
						value: desiredSegment.translations![0].translation,
					},
				],
			},
			description,
			website,
		} as AccountSettingsFragment);
	});

	it('query account settings after update', async () => {
		const account = user.account_user[0].account!;
		const { name, website, description } = updateInput;

		const { data } = await environment.privateApiClient.query<
			AccountSettingsQuery,
			AccountSettingsQueryVariables
		>(QUERY_ACCOUNT_SETTINGS, {
			accountId: account.id,
		});

		expect(data.account).toEqual({
			id: account.id.toString(),
			name,
			segment: {
				id: desiredSegment.id.toString(),
				title: desiredSegment.title,
				translations: [
					{
						language: LanguageCode.En,
						value: desiredSegment.translations![0].translation,
					},
				],
			},
			website,
			description,
		} as AccountSettingsFragment);
	});
});
