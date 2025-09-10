import { Prisma, subscription_plan_price } from '@prisma/client';
import { add, sub } from 'date-fns';
import { AccountUsageKind } from 'src/graphql';

const getUsageCostKeyByUsageKind = (
	usageKind: AccountUsageKind,
): keyof Pick<subscription_plan_price, 'flow_minute_cost' | 'quotation_request_cost'> => {
	switch (usageKind) {
		case AccountUsageKind.quotation:
			return 'quotation_request_cost';
		case AccountUsageKind.flow:
			return 'flow_minute_cost';
	}
};

export const getUsageCostByUsageKind = (
	usageKind: AccountUsageKind,
	subscription_plan_price: subscription_plan_price | undefined,
): Prisma.Decimal => {
	const value: Prisma.Decimal =
		subscription_plan_price?.[getUsageCostKeyByUsageKind(usageKind)] ||
		new Prisma.Decimal(0);

	return value;
};

export const generateNextResetUsageDate = () => {
	return add(new Date(), { months: 1 });
};

export const getPrevResetUsageDate = (usageDate: Date) => {
	return sub(usageDate, { months: 1 });
};
