import { Prisma } from '@prisma/client';

export type ConcurrencyCallsMathInput = {
	totalBalance: Prisma.Decimal;
	dailyBudgetForFlow: number;

	costOfInteractionsToday: Prisma.Decimal;

	activeCampaignsForAccount: number;

	totalInteractionsForFlow: number;
	totalInteractionsForFlowWithCost: number;

	totalOfAnsweredInteractionsForFlow: number;
	totalOfOngoingInteractionsForFlow: number;
	costOfAllInteractions: Prisma.Decimal;

	percentageOfDayLeft: number;
	cronInterval: number;
};

export const concurrencyCallsMath = (input: ConcurrencyCallsMathInput) => {
	const {
		totalBalance,
		dailyBudgetForFlow,

		costOfInteractionsToday,

		activeCampaignsForAccount,

		totalInteractionsForFlow,
		totalInteractionsForFlowWithCost,

		totalOfAnsweredInteractionsForFlow,
		totalOfOngoingInteractionsForFlow,
		costOfAllInteractions,

		percentageOfDayLeft,
		cronInterval,
	} = input;

	// DAILY BUDGETLEFT =
	// IF ((DAILY BUDGET - COST OF INTERACTIONS TODAY) > ACCOUNT BALANCE) {
	// 	ACCOUNT BALANCE / ACTIVE FLOWS
	// } ELSE {
	// 	DAIY BUDGET - COST OF INTERACTIONS TODAY
	// }
	const dailyBudgetLeft = new Prisma.Decimal(dailyBudgetForFlow)
		.sub(costOfInteractionsToday)
		.greaterThan(totalBalance)
		? totalBalance.div(activeCampaignsForAccount)
		: new Prisma.Decimal(dailyBudgetForFlow).sub(costOfInteractionsToday);

	const workableHours = 12;

	const proportionalWorkableHours = new Prisma.Decimal(workableHours).times(
		new Prisma.Decimal(percentageOfDayLeft),
	);

	const averageCostPerCall =
		totalInteractionsForFlowWithCost === 0
			? // Fallback value for average cost per call
			  new Prisma.Decimal(5)
			: costOfAllInteractions.div(totalInteractionsForFlowWithCost);

	const callPerHour = dailyBudgetLeft
		.div(proportionalWorkableHours)
		.div(averageCostPerCall);

	let pickUpRate = totalOfAnsweredInteractionsForFlow / totalInteractionsForFlow;

	if (isNaN(pickUpRate)) {
		pickUpRate = 0.3;
	}

	const concurrencyCalls = callPerHour.div(60 / cronInterval);

	const shouldSentToTwilio = concurrencyCalls
		.sub(totalOfOngoingInteractionsForFlow)
		.div(pickUpRate);

	const finalMath = shouldSentToTwilio.lessThan(0)
		? 0
		: Math.ceil(shouldSentToTwilio.toNumber());

	return finalMath;
};
