import { getQueueToken } from '@nestjs/bull';
import { Prisma, account } from '@prisma/client';
import Bull, { Queue } from 'bull';
import { add, isSameDay } from 'date-fns';
import { USAGE_CONTROL_QUEUE } from 'src/modules/subscriptions/jobs/constants';
import {
	ResetAccountJobData,
	UsageControlQueueData,
} from 'src/modules/subscriptions/jobs/usage-control.queue';
import { CreditsManagerService } from 'src/modules/subscriptions/services/credits-manager.service';
import { UsageManagerService } from 'src/modules/subscriptions/services/usage-manager.service';
import { AccountCreditTransactionReason } from 'src/shared/types/db';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { ALL_JOBS_STATUS } from 'test/shared/helpers/queue';
import { createAccountWithSubscription } from 'test/shared/utils/create-account-with-subscription';

describe('Reset Account Usage', () => {
	let environment: TestEnvironment,
		accountToReset: account,
		accountNotToReset: account,
		queue: Queue<UsageControlQueueData>,
		usageManagerService: UsageManagerService,
		creditsManager: CreditsManagerService;

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		const accountToResetData = await createAccountWithSubscription(environment, {
			accountInput: {
				date_reset_usage: new Date(),
			},
			subscriptionPlanInput: {
				name: 'Plan',
			},
			subscriptionPlanPriceInput: {
				monthly_given_balance: new Prisma.Decimal(100),
			},
		});
		accountToReset = accountToResetData.account;

		// Set one credit for account given by plan
		creditsManager = environment.app.get(CreditsManagerService);

		const creditGivenByPlan = await creditsManager.updateCreditGivenByPlanOnPlanChange(
			accountToReset.id,
			accountToResetData.planPrice,
		);
		await environment.prisma.account_credit.update({
			where: {
				id: creditGivenByPlan!.id,
			},
			data: {
				// used 10
				balance: new Prisma.Decimal(90),
			},
		});

		// Set one credit at the value of 50 for account that is NOT given by plan
		const creditNotGivenByPlan = await creditsManager.creditForAccount(
			accountToReset.id,
			{
				amount: new Prisma.Decimal(50),
				reason: AccountCreditTransactionReason.PlanRenewal,
			},
		);
		await environment.prisma.account_credit.update({
			where: {
				id: creditNotGivenByPlan!.id,
			},
			data: {
				// used 10
				balance: new Prisma.Decimal(40),
			},
		});

		accountNotToReset = (
			await createAccountWithSubscription(environment, {
				accountInput: {
					date_reset_usage: add(new Date(), { days: 1 }),
				},
			})
		).account;

		queue = environment.app.get(getQueueToken(USAGE_CONTROL_QUEUE));
		usageManagerService = environment.app.get(UsageManagerService);
	});

	afterAll(async () => {
		await environment.close();
	});

	let resetAccountJob: Bull.Job<ResetAccountJobData>;

	it('should add correct accounts to queue', async () => {
		await usageManagerService['resetAccountsUsages']();

		const jobs = await queue.getJobs(ALL_JOBS_STATUS);

		expect(jobs).toEqual(
			expect.arrayContaining([
				expect.objectContaining(<Bull.Job<ResetAccountJobData>>{
					data: {
						accountId: accountToReset.id,
					},
				}),
			]),
		);
		expect(jobs).toEqual(
			expect.not.arrayContaining([
				expect.objectContaining(<Bull.Job<ResetAccountJobData>>{
					data: {
						accountId: accountNotToReset.id,
					},
				}),
			]),
		);

		resetAccountJob = jobs.find(
			(v) => v.data.accountId === accountToReset.id,
		) as Bull.Job<ResetAccountJobData>;
	});

	it('resets account usage', async () => {
		await resetAccountJob.finished();

		const account = await environment.prisma.account.findUnique({
			where: {
				id: accountToReset.id,
			},
		});

		expect(isSameDay(add(new Date(), { months: 1 }), account!.date_reset_usage!)).toBe(
			true,
		);
	});

	it('resets credits given by plan', async () => {
		const { balance, credits } = await creditsManager.totalBalanceForAccount(
			accountToReset.id,
		);

		// The given by plan was reseted to the plan value
		// and the not given by plan was not reseted
		expect(balance).toEqual(new Prisma.Decimal(140));

		expect(credits).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					is_given_by_plan: true,
					balance: new Prisma.Decimal(100),
				}),
				expect.objectContaining({
					is_given_by_plan: false,
					balance: new Prisma.Decimal(40),
				}),
			]),
		);
	});
});
