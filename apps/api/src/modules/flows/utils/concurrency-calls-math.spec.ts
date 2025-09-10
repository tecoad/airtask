import { Prisma } from '@prisma/client';
import {
	ConcurrencyCallsMathInput,
	concurrencyCallsMath,
} from './concurrency-calls-math';

describe('Concurrency Calls Math', () => {
	type Each = [input: ConcurrencyCallsMathInput, expectedResult: number];

	const cronInterval = 5;

	it.each<Each>([
		[
			{
				totalBalance: new Prisma.Decimal(726),

				dailyBudgetForFlow: 219,
				costOfInteractionsToday: new Prisma.Decimal(3),

				activeCampaignsForAccount: 1,

				totalInteractionsForFlow: 57,
				totalInteractionsForFlowWithCost: 10,
				totalOfAnsweredInteractionsForFlow: 15,
				totalOfOngoingInteractionsForFlow: 0,
				costOfAllInteractions: new Prisma.Decimal(13.6),

				percentageOfDayLeft: 0.21,
				cronInterval,
			},
			20,
		],
		[
			{
				totalBalance: new Prisma.Decimal(995),

				dailyBudgetForFlow: 371,
				costOfInteractionsToday: new Prisma.Decimal(0),

				activeCampaignsForAccount: 4,

				totalInteractionsForFlow: 3,
				totalInteractionsForFlowWithCost: 0,
				totalOfAnsweredInteractionsForFlow: 1,
				totalOfOngoingInteractionsForFlow: 1,
				costOfAllInteractions: new Prisma.Decimal(0),

				percentageOfDayLeft: 0.1,
				cronInterval,
			},
			13,
		],
		[
			{
				totalBalance: new Prisma.Decimal(551),

				dailyBudgetForFlow: 383,
				costOfInteractionsToday: new Prisma.Decimal(19),

				activeCampaignsForAccount: 2,

				totalInteractionsForFlow: 473,
				totalInteractionsForFlowWithCost: 31,
				totalOfAnsweredInteractionsForFlow: 185,
				totalOfOngoingInteractionsForFlow: 1,
				costOfAllInteractions: new Prisma.Decimal(209.87),

				percentageOfDayLeft: 0.087,
				cronInterval,
			},
			9,
		],
		[
			{
				totalBalance: new Prisma.Decimal(974),

				dailyBudgetForFlow: 214,
				costOfInteractionsToday: new Prisma.Decimal(38),

				activeCampaignsForAccount: 3,

				totalInteractionsForFlow: 495,
				totalInteractionsForFlowWithCost: 28,
				totalOfAnsweredInteractionsForFlow: 185,
				totalOfOngoingInteractionsForFlow: 0,
				costOfAllInteractions: new Prisma.Decimal(133.28),

				percentageOfDayLeft: 0.919,
				cronInterval,
			},
			1,
		],
		[
			{
				totalBalance: new Prisma.Decimal(3063),

				dailyBudgetForFlow: 237,
				costOfInteractionsToday: new Prisma.Decimal(44),

				activeCampaignsForAccount: 5,

				totalInteractionsForFlow: 430,
				totalInteractionsForFlowWithCost: 58,
				totalOfAnsweredInteractionsForFlow: 295,
				totalOfOngoingInteractionsForFlow: 0,
				costOfAllInteractions: new Prisma.Decimal(116.58),

				percentageOfDayLeft: 0.357,
				cronInterval,
			},
			3,
		],
		[
			{
				totalBalance: new Prisma.Decimal(357),

				dailyBudgetForFlow: 418,
				costOfInteractionsToday: new Prisma.Decimal(245),

				activeCampaignsForAccount: 7,

				totalInteractionsForFlow: 338,
				totalInteractionsForFlowWithCost: 213,
				totalOfAnsweredInteractionsForFlow: 308,
				totalOfOngoingInteractionsForFlow: 4,
				costOfAllInteractions: new Prisma.Decimal(296.07),

				percentageOfDayLeft: 0.754,
				cronInterval,
			},
			0,
		],
		[
			{
				totalBalance: new Prisma.Decimal(178),

				dailyBudgetForFlow: 205,
				costOfInteractionsToday: new Prisma.Decimal(39),

				activeCampaignsForAccount: 8,

				totalInteractionsForFlow: 277,
				totalInteractionsForFlowWithCost: 7,
				totalOfAnsweredInteractionsForFlow: 171,
				totalOfOngoingInteractionsForFlow: 0,
				costOfAllInteractions: new Prisma.Decimal(46.97),

				percentageOfDayLeft: 0.156,
				cronInterval,
			},
			2,
		],
		[
			{
				totalBalance: new Prisma.Decimal(100),

				dailyBudgetForFlow: 379,
				costOfInteractionsToday: new Prisma.Decimal(216),

				activeCampaignsForAccount: 3,

				totalInteractionsForFlow: 129,
				totalInteractionsForFlowWithCost: 69,
				totalOfAnsweredInteractionsForFlow: 103,
				totalOfOngoingInteractionsForFlow: 5,
				costOfAllInteractions: new Prisma.Decimal(244.95),

				percentageOfDayLeft: 0.161,
				cronInterval,
			},
			0,
		],
		[
			{
				totalBalance: new Prisma.Decimal(100),

				dailyBudgetForFlow: 330,
				costOfInteractionsToday: new Prisma.Decimal(400),

				activeCampaignsForAccount: 4,

				totalInteractionsForFlow: 283,
				totalInteractionsForFlowWithCost: 93,
				totalOfAnsweredInteractionsForFlow: 107,
				totalOfOngoingInteractionsForFlow: 3,
				costOfAllInteractions: new Prisma.Decimal(292.02),

				percentageOfDayLeft: 0.916,
				cronInterval,
			},
			0,
		],
		[
			{
				totalBalance: new Prisma.Decimal(100),

				dailyBudgetForFlow: 200,
				costOfInteractionsToday: new Prisma.Decimal(0),

				activeCampaignsForAccount: 4,

				totalInteractionsForFlow: 305,
				totalInteractionsForFlowWithCost: 13,
				totalOfAnsweredInteractionsForFlow: 282,
				totalOfOngoingInteractionsForFlow: 0,
				costOfAllInteractions: new Prisma.Decimal(19.5),

				percentageOfDayLeft: 0.178,
				cronInterval,
			},
			1,
		],
		[
			{
				totalBalance: new Prisma.Decimal(10000),

				dailyBudgetForFlow: 5000,
				costOfInteractionsToday: new Prisma.Decimal(0),

				activeCampaignsForAccount: 2,

				totalInteractionsForFlow: 115,
				totalInteractionsForFlowWithCost: 64,
				totalOfAnsweredInteractionsForFlow: 81,
				totalOfOngoingInteractionsForFlow: 2,
				costOfAllInteractions: new Prisma.Decimal(155.52),

				percentageOfDayLeft: 0.239,
				cronInterval,
			},
			83,
		],
		[
			{
				totalBalance: new Prisma.Decimal(2141),

				dailyBudgetForFlow: 288,
				costOfInteractionsToday: new Prisma.Decimal(26),

				activeCampaignsForAccount: 3,

				totalInteractionsForFlow: 69,
				totalInteractionsForFlowWithCost: 21,
				totalOfAnsweredInteractionsForFlow: 52,
				totalOfOngoingInteractionsForFlow: 1,
				costOfAllInteractions: new Prisma.Decimal(32.97),

				percentageOfDayLeft: 0.324,
				cronInterval,
			},
			4,
		],
		[
			{
				totalBalance: new Prisma.Decimal(2329),

				dailyBudgetForFlow: 326,
				costOfInteractionsToday: new Prisma.Decimal(11),

				activeCampaignsForAccount: 6,

				totalInteractionsForFlow: 209,
				totalInteractionsForFlowWithCost: 34,
				totalOfAnsweredInteractionsForFlow: 35,
				totalOfOngoingInteractionsForFlow: 3,
				costOfAllInteractions: new Prisma.Decimal(219.64),

				percentageOfDayLeft: 0.049,
				cronInterval,
			},
			24,
		],
		[
			{
				totalBalance: new Prisma.Decimal(1062),

				dailyBudgetForFlow: 114,
				costOfInteractionsToday: new Prisma.Decimal(25),

				activeCampaignsForAccount: 8,

				totalInteractionsForFlow: 98,
				totalInteractionsForFlowWithCost: 6,
				totalOfAnsweredInteractionsForFlow: 16,
				totalOfOngoingInteractionsForFlow: 3,
				costOfAllInteractions: new Prisma.Decimal(41.76),

				percentageOfDayLeft: 0.016,
				cronInterval,
			},
			16,
		],
		[
			{
				totalBalance: new Prisma.Decimal(2284),

				dailyBudgetForFlow: 330,
				costOfInteractionsToday: new Prisma.Decimal(843),

				activeCampaignsForAccount: 3,

				totalInteractionsForFlow: 407,
				totalInteractionsForFlowWithCost: 193,
				totalOfAnsweredInteractionsForFlow: 340,
				totalOfOngoingInteractionsForFlow: 0,
				costOfAllInteractions: new Prisma.Decimal(1252.57),
				percentageOfDayLeft: 0.57,
				cronInterval,
			},
			0,
		],
		[
			{
				totalBalance: new Prisma.Decimal(2503),

				dailyBudgetForFlow: 59,
				costOfInteractionsToday: new Prisma.Decimal(0),

				activeCampaignsForAccount: 1,

				totalInteractionsForFlow: 440,
				totalInteractionsForFlowWithCost: 6,
				totalOfAnsweredInteractionsForFlow: 39,
				totalOfOngoingInteractionsForFlow: 0,
				costOfAllInteractions: new Prisma.Decimal(15.84),

				percentageOfDayLeft: 0.437,
				cronInterval,
			},
			5,
		],
		[
			{
				totalBalance: new Prisma.Decimal(2361),

				dailyBudgetForFlow: 171,
				costOfInteractionsToday: new Prisma.Decimal(5),

				activeCampaignsForAccount: 8,

				totalInteractionsForFlow: 51,
				totalInteractionsForFlowWithCost: 3,
				totalOfAnsweredInteractionsForFlow: 35,
				totalOfOngoingInteractionsForFlow: 0,
				costOfAllInteractions: new Prisma.Decimal(8.58),

				percentageOfDayLeft: 0.279,
				cronInterval,
			},
			3,
		],
		[
			{
				totalBalance: new Prisma.Decimal(2720),

				dailyBudgetForFlow: 53,
				costOfInteractionsToday: new Prisma.Decimal(18),

				activeCampaignsForAccount: 2,

				totalInteractionsForFlow: 71,
				totalInteractionsForFlowWithCost: 19,
				totalOfAnsweredInteractionsForFlow: 38,
				totalOfOngoingInteractionsForFlow: 0,
				costOfAllInteractions: new Prisma.Decimal(43.32),

				percentageOfDayLeft: 0.674,
				cronInterval,
			},
			1,
		],
	])('works with calc %#', (input, result) => {
		expect(concurrencyCallsMath(input)).toBe(result);
	});
});
