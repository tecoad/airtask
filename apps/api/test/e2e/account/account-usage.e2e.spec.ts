import {
	Prisma,
	account,
	account_credit,
	flow,
	subscription,
	subscription_plan_price,
} from '@prisma/client';
import { AccountUsageKind, FlowStatus, SubscriptionStatus } from 'src/graphql';
import { CreditsManagerService } from 'src/modules/subscriptions/services/credits-manager.service';
import { UsageManagerService } from 'src/modules/subscriptions/services/usage-manager.service';
import { AccountCreditTransactionReason } from 'src/shared/types/db';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { createAccountWithSubscription } from 'test/shared/utils/create-account-with-subscription';
import { createFlowForAccount } from 'test/shared/utils/create-flow-for-account';

describe('Account Usage', () => {
	let environment: TestEnvironment,
		account: account,
		planPrice: subscription_plan_price,
		subscription: subscription,
		creditsManager: CreditsManagerService,
		usageManager: UsageManagerService;

	const activeFlows: flow[] = [];

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		creditsManager = environment.app.get(CreditsManagerService);
		usageManager = environment.app.get(UsageManagerService);

		const accountData = await createAccountWithSubscription(environment, {
			subscriptionPlanInput: {
				name: 'Plan',
				allowed_modules: [AccountUsageKind.flow],
			},
			subscriptionPlanPriceInput: {
				monthly_given_balance: new Prisma.Decimal(0.85),
				flow_minute_cost: new Prisma.Decimal(0.85),
				quotation_request_cost: new Prisma.Decimal(1),
			},
		});

		account = accountData.account;
		subscription = accountData.subscription;
		planPrice = accountData.planPrice;

		activeFlows.push(
			(
				await createFlowForAccount(environment, {
					accountId: account.id,
					flowInput: {
						status: FlowStatus.active,
					},
				})
			).flow,
			(
				await createFlowForAccount(environment, {
					accountId: account.id,
					flowInput: {
						status: FlowStatus.active,
					},
				})
			).flow,
		);
	});

	afterAll(async () => {
		await environment.close();
	});

	it('first see balance of 0', async () => {
		const { balance, credits } = await creditsManager.totalBalanceForAccount(account.id);
		expect(balance).toEqual(new Prisma.Decimal(0));
		expect(credits).toEqual([]);
	});

	it('is not allowed to perform operation if balance is 0', async () => {
		const isAllowed = await usageManager.isAccountAllowedToPerformOperation(
			account.id,
			AccountUsageKind.flow,
			1,
		);
		expect(isAllowed).toBe(false);
	});

	it('create credit given by plan', async () => {
		const givenByPlan = await creditsManager.updateCreditGivenByPlanOnPlanChange(
			account.id,
			planPrice,
		);

		const { balance, credits } = await creditsManager.totalBalanceForAccount(account.id);
		expect(balance).toEqual(new Prisma.Decimal(0.85));
		expect(credits).toEqual([givenByPlan]);
	});

	it('is allowed to perform operation if balance is the same as one usage', async () => {
		const isAllowed = await usageManager.isAccountAllowedToPerformOperation(
			account.id,
			AccountUsageKind.flow,
			1,
		);
		expect(isAllowed).toBe(true);
	});

	it('is not allowed to perform operation if balance is less than the usages needed', async () => {
		const isAllowed = await usageManager.isAccountAllowedToPerformOperation(
			account.id,
			AccountUsageKind.flow,
			2,
		);
		expect(isAllowed).toBe(false);
	});

	it('is allowed to perform operation if balance is greater than one usage', async () => {
		await creditsManager.creditForAccount(account.id, {
			amount: new Prisma.Decimal(1),
			reason: AccountCreditTransactionReason.CreditBuy,
		});

		const isAllowed = await usageManager.isAccountAllowedToPerformOperation(
			account.id,
			AccountUsageKind.flow,
			1,
		);
		expect(isAllowed).toBe(true);
	});

	it('is not allowed to perform operation if module is not at plan ', async () => {
		const isAllowed = await usageManager.isAccountAllowedToPerformOperation(
			account.id,
			AccountUsageKind.quotation,
			1,
		);
		expect(isAllowed).toBe(false);
	});

	it('is not allowed to perform operation if subscription is not active', async () => {
		await environment.prisma.subscription.update({
			where: { id: subscription.id },
			data: { status: SubscriptionStatus.cancelled },
		});

		const isAllowed = await usageManager.isAccountAllowedToPerformOperation(
			account.id,
			AccountUsageKind.flow,
			1,
		);
		expect(isAllowed).toBe(false);

		// then we activate it again
		await environment.prisma.subscription.update({
			where: { id: subscription.id },
			data: { status: SubscriptionStatus.active },
		});
	});

	it('see balance after add credit', async () => {
		await creditsManager.creditForAccount(account.id, {
			amount: new Prisma.Decimal(100),
			reason: AccountCreditTransactionReason.CreditBuy,
		});

		const { balance, credits } = await creditsManager.totalBalanceForAccount(account.id);
		expect(balance).toEqual(new Prisma.Decimal(101.85));
		expect(credits).toHaveLength(3);
	});

	// Now, we have the credit given by the plan with 0.85 of balance,
	// one credit of 1.00 and another of 100.00
	// Now, we will create a flow usage that is also 0.85, and only the credit given by the plan should be used

	it('consumes 1 usage for module', async () => {
		await usageManager.createAccountUsageForOperation(
			account.id,
			AccountUsageKind.flow,
			1,
		);

		const { balance, credits } = await creditsManager.totalBalanceForAccount(account.id);
		expect(balance).toEqual(new Prisma.Decimal(101));
		expect(credits).toEqual([
			expect.objectContaining(<Partial<account_credit>>{
				is_given_by_plan: true,
				amount: new Prisma.Decimal(0.85),
				balance: new Prisma.Decimal(0),
			}),
			expect.objectContaining(<Partial<account_credit>>{
				is_given_by_plan: false,
				amount: new Prisma.Decimal(1),
				balance: new Prisma.Decimal(1),
			}),
			expect.objectContaining(<Partial<account_credit>>{
				is_given_by_plan: false,
				amount: new Prisma.Decimal(100),
				balance: new Prisma.Decimal(100),
			}),
		]);
	});

	it('consumes 1 usage and debit from order of credit date_created', async () => {
		await usageManager.createAccountUsageForOperation(
			account.id,
			AccountUsageKind.flow,
			1,
		);

		const { balance, credits } = await creditsManager.totalBalanceForAccount(account.id);
		expect(balance).toEqual(new Prisma.Decimal(100.15));
		expect(credits).toEqual([
			expect.objectContaining(<Partial<account_credit>>{
				is_given_by_plan: true,
				amount: new Prisma.Decimal(0.85),
				balance: new Prisma.Decimal(0),
			}),
			expect.objectContaining(<Partial<account_credit>>{
				is_given_by_plan: false,
				amount: new Prisma.Decimal(1),
				balance: new Prisma.Decimal(0.15),
			}),
			expect.objectContaining(<Partial<account_credit>>{
				is_given_by_plan: false,
				amount: new Prisma.Decimal(100),
				balance: new Prisma.Decimal(100),
			}),
		]);
	});

	it('consumes usages to credit total from one credit and partial from another', async () => {
		await usageManager.createAccountUsageForOperation(
			account.id,
			AccountUsageKind.flow,
			1,
		);

		const { balance, credits } = await creditsManager.totalBalanceForAccount(account.id);
		expect(balance).toEqual(new Prisma.Decimal(99.3));
		expect(credits).toEqual([
			expect.objectContaining(<Partial<account_credit>>{
				is_given_by_plan: true,
				amount: new Prisma.Decimal(0.85),
				balance: new Prisma.Decimal(0),
			}),
			expect.objectContaining(<Partial<account_credit>>{
				is_given_by_plan: false,
				amount: new Prisma.Decimal(1),
				balance: new Prisma.Decimal(0),
			}),
			expect.objectContaining(<Partial<account_credit>>{
				is_given_by_plan: false,
				amount: new Prisma.Decimal(100),
				balance: new Prisma.Decimal(99.3),
			}),
		]);
	});

	it('consumes usages to get a zero balance', async () => {
		// Add 17,7 credits to get of a balance of 117 that is multiple
		// of 0.85
		await creditsManager.creditForAccount(account.id, {
			amount: new Prisma.Decimal(17.7),
			reason: AccountCreditTransactionReason.CreditBuy,
		});
		const { balance } = await creditsManager.totalBalanceForAccount(account.id);
		expect(balance).toEqual(new Prisma.Decimal(117));

		// Now we consume 117 / 0.85 = 137.65 usages
		await usageManager.createAccountUsageForOperation(
			account.id,
			AccountUsageKind.flow,
			137.65,
		);

		const { balance: balanceAfterUsage } = await creditsManager.totalBalanceForAccount(
			account.id,
		);
		expect(balanceAfterUsage).toEqual(new Prisma.Decimal(0));
	});

	const assertsOfNegativeOrZeroBalanceEffects = (getBackToNormal?: boolean) => {
		it('Flow', async () => {
			const flows = await environment.prisma.flow.findMany({
				where: {
					id: {
						in: activeFlows.map((flow) => flow.id),
					},
				},
			});

			expect(flows.every((v) => v.status === FlowStatus.stopped)).toBe(true);

			if (getBackToNormal) {
				await environment.prisma.flow.updateMany({
					where: {
						id: {
							in: activeFlows.map((flow) => flow.id),
						},
					},
					data: {
						status: FlowStatus.active,
					},
				});
			}
		});
	};

	describe('See effects of non balance', () => {
		assertsOfNegativeOrZeroBalanceEffects(true);
	});

	it('consumes more usages than the total balance and get a negative balance', async () => {
		await usageManager.createAccountUsageForOperation(
			account.id,
			AccountUsageKind.flow,
			1,
		);

		const { balance, credits } = await creditsManager.totalBalanceForAccount(account.id);
		expect(balance).toEqual(new Prisma.Decimal(-0.85));
		expect(credits).toEqual([
			expect.objectContaining(<Partial<account_credit>>{
				is_given_by_plan: true,
				amount: new Prisma.Decimal(0.85),
				balance: new Prisma.Decimal(0),
			}),
			expect.objectContaining(<Partial<account_credit>>{
				is_given_by_plan: false,
				amount: new Prisma.Decimal(1),
				balance: new Prisma.Decimal(0),
			}),
			expect.objectContaining(<Partial<account_credit>>{
				is_given_by_plan: false,
				amount: new Prisma.Decimal(100),
				balance: new Prisma.Decimal(0),
			}),
			expect.objectContaining(<Partial<account_credit>>{
				is_given_by_plan: false,
				amount: new Prisma.Decimal(17.7),
				balance: new Prisma.Decimal(0),
			}),
			expect.objectContaining(<Partial<account_credit>>{
				is_given_by_plan: false,
				amount: new Prisma.Decimal(-0.85),
				balance: new Prisma.Decimal(-0.85),
			}),
		]);
	});

	describe('See effects of negative balance', () => {
		assertsOfNegativeOrZeroBalanceEffects();
	});
});
