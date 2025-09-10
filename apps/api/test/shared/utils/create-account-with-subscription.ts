import { Prisma } from '@prisma/client';
import {
	AccountUsageKind,
	CurrencyCode,
	PlanInterval,
	SubscriptionStatus,
} from 'src/graphql';
import { TestEnvironment } from 'test/config/setup-test-environment';
import { v4 } from 'uuid';

export const createAccountWithSubscription = async (
	environment: TestEnvironment,
	data?: {
		accountInput?: Prisma.accountCreateInput;
		subscriptionInput?: Partial<Prisma.subscriptionCreateInput>;
		subscriptionPlanInput?: Prisma.subscription_planCreateInput;
		subscriptionPlanPriceInput?: Partial<Prisma.subscription_plan_priceCreateInput>;
	},
) => {
	const {
		accountInput,
		subscriptionInput,
		subscriptionPlanInput,
		subscriptionPlanPriceInput,
	} = data || {};

	const account = await environment.prisma.account.create({
		data: {
			name: 'Account',
			...accountInput,
		},
	});

	const plan = await environment.prisma.subscription_plan.create({
		data: {
			name: 'Plan',
			allowed_modules: [AccountUsageKind.quotation],
			...subscriptionPlanInput,
		},
	});
	const planPrice = await environment.prisma.subscription_plan_price.create({
		data: {
			id: v4(),
			currency: CurrencyCode.BRL,
			interval: PlanInterval.month,
			plan: plan.id,
			...(subscriptionPlanPriceInput as any),
		},
	});
	const subscription = await environment.prisma.subscription.create({
		data: {
			subscription_plan_subscription_subscription_planTosubscription_plan: {
				connect: {
					id: plan.id,
				},
			},
			subscription_plan_price: {
				connect: {
					id: planPrice.id,
				},
			},
			account_subscription_accountToaccount: {
				connect: {
					id: account.id,
				},
			},
			recurring_interval: PlanInterval.month,
			status: SubscriptionStatus.active,
			...subscriptionInput,
		},
	});

	return {
		account,
		plan,
		planPrice,
		subscription,
	};
};
