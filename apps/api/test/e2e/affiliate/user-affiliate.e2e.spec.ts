import { UnauthorizedException } from '@nestjs/common';
import { user } from '@prisma/client';
import { HasherSerice } from 'src/modules/common/services/hasher.service';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import {
	ACTIVE_USER_AFFILIATE,
	CREATE_USER_AFFILIATE,
	IS_AFFILIATE_ALIAS_AVAILABLE,
	UPDATE_USER_AFFILIATE,
} from 'test/shared/gql/private/user-affiliate';
import {
	ActiveUserAffiliateQuery,
	ActiveUserAffiliateQueryVariables,
	Affiliate,
	AffiliateFragment,
	AffiliatePayoutMethod,
	AffiliateSettingsResultError,
	AffiliateSettingsResultErrorCode,
	AffiliateStatus,
	CreateAffiliateForUserMutation,
	CreateAffiliateForUserMutationVariables,
	IsAffiliateAliasAvailableQuery,
	IsAffiliateAliasAvailableQueryVariables,
	UpdateUserAffiliateMutation,
	UpdateUserAffiliateMutationVariables,
} from 'test/shared/test-gql-private-api-schema.ts';
import { createUserWithoutAccount } from 'test/shared/utils/create-user-without-account';
import { v4 } from 'uuid';

jest.setTimeout(30000);

describe('Manage User Affiliate', () => {
	let user: user, environment: TestEnvironment;

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		user = await createUserWithoutAccount(environment, {
			userInput: {
				password: await environment.app.get(HasherSerice).hash('correct-password'),
			},
		});
	});

	afterAll(async () => {
		await environment.close();
	});

	it('cant query user affiliate if not authenticated', async () => {
		await expect(
			environment.privateApiClient.query<
				ActiveUserAffiliateQuery,
				ActiveUserAffiliateQueryVariables
			>(ACTIVE_USER_AFFILIATE),
		).rejects.toThrowError(new UnauthorizedException().message);

		// Auth for next tests
		environment.privateApiClient.authenticateAsUser(user.id, user.email);
	});

	it('query user affiliate before create', async () => {
		const { data } = await environment.privateApiClient.query<
			ActiveUserAffiliateQuery,
			ActiveUserAffiliateQueryVariables
		>(ACTIVE_USER_AFFILIATE);

		expect(data.activeUserAffiliate).toBeNull();
	});

	const alias = v4();

	it('check alias availability', async () => {
		const { data } = await environment.privateApiClient.query<
			IsAffiliateAliasAvailableQuery,
			IsAffiliateAliasAvailableQueryVariables
		>(IS_AFFILIATE_ALIAS_AVAILABLE, {
			alias,
		});

		expect(data.isAffiliateAliasAvailable).toBe(true);
	});

	it('cant create user affiliate if not authenticated', async () => {
		environment.privateApiClient.deleteAuthorizationToken();

		await expect(
			environment.privateApiClient.query<
				CreateAffiliateForUserMutation,
				CreateAffiliateForUserMutationVariables
			>(CREATE_USER_AFFILIATE, {
				input: {
					alias,
					payout_method: AffiliatePayoutMethod.Paypal,
					payout_method_key: 'key',
					password: 'any',
				},
			}),
		).rejects.toThrowError(new UnauthorizedException().message);

		// Auth for next tests
		environment.privateApiClient.authenticateAsUser(user.id, user.email);
	});

	it('cant create user affiliate if not authenticated with wrong password', async () => {
		const { data } = await environment.privateApiClient.query<
			CreateAffiliateForUserMutation,
			CreateAffiliateForUserMutationVariables
		>(CREATE_USER_AFFILIATE, {
			input: {
				alias,
				payout_method: AffiliatePayoutMethod.Paypal,
				payout_method_key: 'key',
				password: 'wrong-password',
			},
		});

		expect(data.createAffiliateForUser).toEqual(<AffiliateSettingsResultError>{
			errorCode: AffiliateSettingsResultErrorCode.InvalidPassword,
			message: expect.any(String),
		});
	});

	it('must stay without affiliate after failed create attempts', async () => {
		const { data } = await environment.privateApiClient.query<
			ActiveUserAffiliateQuery,
			ActiveUserAffiliateQueryVariables
		>(ACTIVE_USER_AFFILIATE);

		expect(data.activeUserAffiliate).toBeNull();
	});

	let affiliate: AffiliateFragment;

	it('create user affiliate', async () => {
		const { data } = await environment.privateApiClient.query<
			CreateAffiliateForUserMutation,
			CreateAffiliateForUserMutationVariables
		>(CREATE_USER_AFFILIATE, {
			input: {
				alias,
				payout_method: AffiliatePayoutMethod.Paypal,
				payout_method_key: 'key',
				password: 'correct-password',
			},
		});

		expect(data.createAffiliateForUser).toEqual({
			id: expect.any(String),
			alias,
			date_created: expect.any(String),
			date_updated: null,
			payout_method: AffiliatePayoutMethod.Paypal,
			payout_method_key: 'key',
			status: AffiliateStatus.Active,
			comission_duration_months: expect.any(Number),
			comission_percentage: expect.any(Number),
		} as AffiliateFragment);

		affiliate = data.createAffiliateForUser as Affiliate;
	});

	it('check alias availability for already used alias', async () => {
		const { data } = await environment.privateApiClient.query<
			IsAffiliateAliasAvailableQuery,
			IsAffiliateAliasAvailableQueryVariables
		>(IS_AFFILIATE_ALIAS_AVAILABLE, {
			alias,
		});

		expect(data.isAffiliateAliasAvailable).toBe(false);
	});

	it('query user affiliate after create', async () => {
		const { data } = await environment.privateApiClient.query<
			ActiveUserAffiliateQuery,
			ActiveUserAffiliateQueryVariables
		>(ACTIVE_USER_AFFILIATE);

		expect(data.activeUserAffiliate).toEqual(affiliate);
	});

	it('cant update user affiliate if not authenticated', async () => {
		environment.privateApiClient.deleteAuthorizationToken();
		await expect(
			environment.privateApiClient.query<
				UpdateUserAffiliateMutation,
				UpdateUserAffiliateMutationVariables
			>(UPDATE_USER_AFFILIATE, {
				input: {
					alias: v4(),
					password: 'any',
				},
			}),
		).rejects.toThrowError(new UnauthorizedException().message);

		// Auth for next tests
		environment.privateApiClient.authenticateAsUser(user.id, user.email);
	});

	it('cant update user affiliate with wrong password', async () => {
		const { data } = await environment.privateApiClient.query<
			UpdateUserAffiliateMutation,
			UpdateUserAffiliateMutationVariables
		>(UPDATE_USER_AFFILIATE, {
			input: {
				alias: v4(),
				password: 'wrong-password',
			},
		});

		expect(data.updateUserAffiliate).toEqual(<AffiliateSettingsResultError>{
			errorCode: AffiliateSettingsResultErrorCode.InvalidPassword,
			message: expect.any(String),
		});
	});

	it('must stay with old alias after failed update attempts', async () => {
		const { data } = await environment.privateApiClient.query<
			ActiveUserAffiliateQuery,
			ActiveUserAffiliateQueryVariables
		>(ACTIVE_USER_AFFILIATE);

		expect(data.activeUserAffiliate).toEqual(affiliate);
	});

	it('update user affiliate', async () => {
		const newAlias = v4();
		const { data } = await environment.privateApiClient.query<
			UpdateUserAffiliateMutation,
			UpdateUserAffiliateMutationVariables
		>(UPDATE_USER_AFFILIATE, {
			input: {
				alias: newAlias,
				payout_method: AffiliatePayoutMethod.Pix,
				payout_method_key: 'key2',
				password: 'correct-password',
			},
		});

		expect(data.updateUserAffiliate).toEqual({
			...affiliate,
			date_updated: expect.any(String),
			alias: newAlias,
			payout_method: AffiliatePayoutMethod.Pix,
			payout_method_key: 'key2',
		} as AffiliateFragment);

		affiliate = data.updateUserAffiliate as Affiliate;
	});

	it('query user affiliate after update', async () => {
		const { data } = await environment.privateApiClient.query<
			ActiveUserAffiliateQuery,
			ActiveUserAffiliateQueryVariables
		>(ACTIVE_USER_AFFILIATE);

		expect(data.activeUserAffiliate).toEqual(affiliate);
	});

	it('check alias availability for old alias', async () => {
		const { data } = await environment.privateApiClient.query<
			IsAffiliateAliasAvailableQuery,
			IsAffiliateAliasAvailableQueryVariables
		>(IS_AFFILIATE_ALIAS_AVAILABLE, {
			alias,
		});

		expect(data.isAffiliateAliasAvailable).toBe(true);
	});
});
