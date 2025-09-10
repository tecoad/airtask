import { subscription_plan } from '@prisma/client';
import {
	setupTestEnvironment,
	TestEnvironment,
} from 'test/config/setup-test-environment';
import { SUBSCRIPTION_PLANS } from 'test/shared/gql/private/subscription-plan';
import {
	CurrencyCode,
	PlanInterval,
	SubscriptionPlansQuery,
	SubscriptionPlansQueryVariables,
} from 'test/shared/test-gql-private-api-schema.ts';
import { v4 } from 'uuid';

jest.setTimeout(20000);

describe('List Subscription Plans', () => {
	let environment: TestEnvironment;
	let plan: subscription_plan;

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		await environment.prisma.subscription_plan_price.deleteMany({
			where: {
				external_id: {
					in: ['price_1', 'price_2', 'price_3', 'price_4'],
				},
			},
		});

		plan = await environment.prisma.subscription_plan.create({
			data: {
				name: 'Pro Test Plan',
				is_active: true,
				subscription_plan_price: {
					createMany: {
						data: [
							{
								id: v4(),
								currency: CurrencyCode.Brl,
								price: '10',
								interval: PlanInterval.Month,
								external_id: 'price_1',
							},
							{
								id: v4(),
								currency: CurrencyCode.Brl,
								price: '100',
								interval: PlanInterval.Year,
								external_id: 'price_2',
							},
							{
								id: v4(),
								currency: CurrencyCode.Usd,
								price: '3',
								interval: PlanInterval.Month,
								external_id: 'price_3',
							},
							{
								id: v4(),
								currency: CurrencyCode.Usd,
								price: '30',
								interval: PlanInterval.Year,
								external_id: 'price_4',
							},
						],
					},
				},
			},
		});
	});

	afterAll(async () => {
		await environment.prisma.subscription_plan.delete({
			where: { id: plan.id },
		});

		await environment.close();
	});

	it('list subscription plans', async () => {
		const { data } = await environment.privateApiClient.query<
			SubscriptionPlansQuery,
			SubscriptionPlansQueryVariables
		>(SUBSCRIPTION_PLANS);

		expect(data.subscriptionPlans).toEqual(
			expect.arrayContaining([
				{
					id: plan.id.toString(),
					name: plan.name,
					prices: [
						{
							currency: CurrencyCode.Brl,
							price: '10',
							interval: PlanInterval.Month,
							external_id: 'price_1',
						},
						{
							currency: CurrencyCode.Brl,
							price: '100',
							interval: PlanInterval.Year,
							external_id: 'price_2',
						},
						{
							currency: CurrencyCode.Usd,
							price: '3',
							interval: PlanInterval.Month,
							external_id: 'price_3',
						},
						{
							currency: CurrencyCode.Usd,
							price: '30',
							interval: PlanInterval.Year,
							external_id: 'price_4',
						},
					],
				},
			] as SubscriptionPlansQuery['subscriptionPlans']),
		);
	});

	it('should not list plans that are not active', async () => {
		await environment.prisma.subscription_plan.update({
			where: {
				id: plan.id,
			},
			data: {
				is_active: false,
			},
		});

		const { data } = await environment.privateApiClient.query<
			SubscriptionPlansQuery,
			SubscriptionPlansQueryVariables
		>(SUBSCRIPTION_PLANS);

		expect(data.subscriptionPlans).toEqual(
			expect.not.arrayContaining([
				expect.objectContaining({
					id: plan.id.toString(),
				}),
			]),
		);
	});
});
