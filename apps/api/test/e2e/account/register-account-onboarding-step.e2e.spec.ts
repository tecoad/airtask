import { faker } from '@faker-js/faker';
import { account, account_user, user } from '@prisma/client';
import { OnBoardingStepsService } from 'src/modules/accounts/services/onboard-steps.service';
import { AccountRole } from 'src/shared/types/db';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { REGISTER_ACCOUNT_ONBOARDING_STEP } from 'test/shared/gql/private/account';
import { ACTIVE_USER_WITH_ACCOUNTS } from 'test/shared/gql/private/user';
import {
	AccountUsageKind,
	ActiveUserWithAccountsQuery,
	ActiveUserWithAccountsQueryVariables,
	OnBoardingStepFragment,
	OnBoardingStepName,
	RegisterOnboardingStepForAccountMutation,
	RegisterOnboardingStepForAccountMutationVariables,
} from 'test/shared/test-gql-private-api-schema.ts';

jest.setTimeout(15000);

describe('Register Account OnBoarding Step', () => {
	let user: user & {
			account_user: (account_user & {
				account: account | null;
			})[];
		},
		environment: TestEnvironment;
	const stepName = OnBoardingStepName.CreateFirstQuotation,
		stepModule = AccountUsageKind.Quotation,
		secondStepName = OnBoardingStepName.FirstQuotationCopyLink,
		secondStepModule = AccountUsageKind.Quotation;

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		user = await environment.prisma.user.create({
			data: {
				first_name: 'John',
				last_name: 'Doe',
				email: faker.internet.email(),
				account_user: {
					create: [
						{
							account: {
								create: {
									name: 'Account',
								},
							},
							role: AccountRole.Owner,
						},
					],
				},
			},
			include: {
				account_user: {
					include: {
						account: true,
					},
				},
			},
		});

		const plan = await environment.prisma.subscription_plan.create({
			data: {
				name: 'Plan',
				allowed_modules: [AccountUsageKind.Quotation],
			},
		});
		await environment.prisma.subscription.create({
			data: {
				subscription_plan: plan.id,
				account: user.account_user[0].account_id,
			},
		});

		environment.privateApiClient.authenticateAsUser(user.id, user.email);
	});

	afterAll(async () => {
		await environment.close();
	});

	it('see account onboarding steps', async () => {
		const { data } = await environment.privateApiClient.query<
			ActiveUserWithAccountsQuery,
			ActiveUserWithAccountsQueryVariables
		>(ACTIVE_USER_WITH_ACCOUNTS);

		// Empty for init
		expect(data.activeUser?.accounts[0].account.concluded_onboarding_steps).toEqual([]);
	});

	let newStep: OnBoardingStepFragment;

	it('register new step', async () => {
		const { data } = await environment.privateApiClient.query<
			RegisterOnboardingStepForAccountMutation,
			RegisterOnboardingStepForAccountMutationVariables
		>(REGISTER_ACCOUNT_ONBOARDING_STEP, {
			accountId: user.account_user[0].account_id!.toString()!,
			step: stepName,
		});

		expect(data.registerOnboardingStepForAccount).toEqual(<OnBoardingStepFragment>{
			id: expect.any(String),
			date_created: expect.any(String),
			name: stepName,
			module: stepModule,
		});

		newStep = data.registerOnboardingStepForAccount!;
	});

	it('see account onboarding steps with new step', async () => {
		const { data } = await environment.privateApiClient.query<
			ActiveUserWithAccountsQuery,
			ActiveUserWithAccountsQueryVariables
		>(ACTIVE_USER_WITH_ACCOUNTS);

		// Empty for init
		expect(data.activeUser?.accounts[0].account.concluded_onboarding_steps).toEqual([
			newStep,
		]);
	});

	// Inside the class the have a method to register a new step with queue
	// so we need to make sure this queue is working
	it('register new step with queue', async () => {
		const onBoardingStepsService = environment.app.get(OnBoardingStepsService);

		const job = (await onBoardingStepsService.queueEnsureStepForAccount(
			user.account_user[0].account_id!,
			secondStepName as any,
		))!;

		// Wait for job to finish
		await job.finished();

		const { data } = await environment.privateApiClient.query<
			ActiveUserWithAccountsQuery,
			ActiveUserWithAccountsQueryVariables
		>(ACTIVE_USER_WITH_ACCOUNTS);

		// Avoid order error
		const expected: OnBoardingStepFragment[] = [
			newStep,
			{
				id: expect.any(String),
				date_created: expect.any(String),
				name: secondStepName,
				module: secondStepModule,
			},
		];

		expect(data.activeUser?.accounts[0].account.concluded_onboarding_steps).toHaveLength(
			expected.length,
		);
		expect(data.activeUser?.accounts[0].account.concluded_onboarding_steps).toEqual(
			expect.arrayContaining(expected),
		);
	});
});
