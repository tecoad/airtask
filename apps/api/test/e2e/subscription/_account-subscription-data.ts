import { add } from 'date-fns';
import { AccountUsageKind, PlanInterval } from 'src/graphql';
import { getPrevResetUsageDate } from 'src/modules/subscriptions/helpers';

import { UnauthorizedException } from '@nestjs/common';
import { UserNotAAccountMemberError } from 'src/shared/errors';
import {
	setupTestEnvironment,
	TestEnvironment,
} from 'test/config/setup-test-environment';
import { ACCOUNT_SUBSCRIPTION_DATA } from 'test/shared/gql/private/account';
import {
	AccountSubscriptionDataQuery,
	AccountSubscriptionDataQueryVariables,
} from 'test/shared/test-gql-private-api-schema.ts';
import {
	createUserAsAccountOwner,
	UserWithAccounts,
} from 'test/shared/utils/create-user-as-account-owner';

jest.setTimeout(15000);

describe('Account Subscription Data', () => {
	let user: UserWithAccounts,
		userIntoAnotherAccount: UserWithAccounts,
		accountId: number,
		environment: TestEnvironment;
	const resetUsage = add(new Date(), { months: 1 });

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		user = await createUserAsAccountOwner(environment, {
			accountInput: {
				date_reset_usage: resetUsage,
			},
		});
		accountId = Number(user.account_user[0].account_id);
		userIntoAnotherAccount = await createUserAsAccountOwner(environment);

		const plan = await environment.prisma.subscription_plan.create({
			data: {
				name: 'Plan',
				quotation_usage_limit: 100,
				allowed_modules: [AccountUsageKind.quotation],
			},
		});
		await environment.prisma.subscription.create({
			data: {
				subscription_plan: plan.id,
				account: user.account_user[0].account_id,
				recurring_interval: PlanInterval.month,
			},
		});
	});

	afterAll(async () => {
		await environment.close();
	});

	it('cant see subscription data without auth', async () => {
		await expect(
			environment.privateApiClient.query<
				AccountSubscriptionDataQuery,
				AccountSubscriptionDataQueryVariables
			>(ACCOUNT_SUBSCRIPTION_DATA, {
				accountId,
			}),
		).rejects.toThrowError(new UnauthorizedException().message);
	});

	it('cant see subscription data as member of another account', async () => {
		environment.privateApiClient.authenticateAsUser(
			userIntoAnotherAccount.id,
			userIntoAnotherAccount.email,
		);

		await expect(
			environment.privateApiClient.query<
				AccountSubscriptionDataQuery,
				AccountSubscriptionDataQueryVariables
			>(ACCOUNT_SUBSCRIPTION_DATA, {
				accountId,
			}),
		).rejects.toThrowError(new UserNotAAccountMemberError().message);
	});

	it('see subscription data', async () => {
		environment.privateApiClient.authenticateAsUser(user.id, user.email);

		const { data } = await environment.privateApiClient.query<
			AccountSubscriptionDataQuery,
			AccountSubscriptionDataQueryVariables
		>(ACCOUNT_SUBSCRIPTION_DATA, {
			accountId,
		});

		expect(data.accountSubscriptionData).toEqual({
			extra_credits: 0,
			plan: 'Plan',
			plan_interval: PlanInterval.month,
			usages: [
				{
					usages: 0,
					module: AccountUsageKind.quotation,
					maxUsages: 100,
				},
			],
			period_start: getPrevResetUsageDate(resetUsage).toISOString(),
			period_end: resetUsage.toISOString(),
		});
	});

	// it('see usage after usage', async () => {
	// 	await environment.app
	// 		.get(UsageManagerService)
	// 		.createAccountUsageForOperation(
	// 			user.account_user[0].account_id!,
	// 			MainAccountUsageKind.quotation,
	// 		);

	// 	const { data } = await environment.privateApiClient.query<
	// 		AccountSubscriptionDataQuery,
	// 		AccountSubscriptionDataQueryVariables
	// 	>(ACCOUNT_SUBSCRIPTION_DATA, {
	// 		accountId,
	// 	});

	// 	expect(data.accountSubscriptionData?.usages).toEqual([
	// 		{
	// 			usages: 1,
	// 			module: AccountUsageKind.quotation,
	// 			maxUsages: 100,
	// 		},
	// 	]);
	// });

	// it('see extra credits after create', async () => {
	// 	await environment.prisma.extra_credit.createMany({
	// 		data: Array.from({
	// 			length: 2,
	// 		}).map<Prisma.extra_creditCreateManyInput>(() => ({
	// 			account: user.account_user[0].account_id!,
	// 			status: ExtraCreditStatus.Available,
	// 		})),
	// 	});

	// 	const { data } = await environment.privateApiClient.query<
	// 		AccountSubscriptionDataQuery,
	// 		AccountSubscriptionDataQueryVariables
	// 	>(ACCOUNT_SUBSCRIPTION_DATA, {
	// 		accountId,
	// 	});

	// 	expect(data.accountSubscriptionData?.extra_credits).toBe(2);
	// });
});
