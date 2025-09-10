import { faker } from '@faker-js/faker';
import { getQueueToken } from '@nestjs/bull';
import { Prisma, account, flow, flow_agent, flow_contact_segment } from '@prisma/client';
import { Queue } from 'bull';
import { sub } from 'date-fns';
import { AccountUsageKind, FlowContactStatus } from 'src/graphql';
import {
	FLOW_CALCULATE_CONCURRENCY_CALLS_JOB,
	FLOW_CAMPAIGN_INTERACTIONS_QUEUE,
	FlowCampaignInteractionsQueue,
	FlowCampaignInteractionsQueueData,
} from 'src/modules/flows/queues/flow-interaction.queue';
import { FlowsService } from 'src/modules/flows/services/flows.service';
import {
	ConcurrencyCallsMathInput,
	concurrencyCallsMath,
} from 'src/modules/flows/utils/concurrency-calls-math';
import { remainingDayFraction } from 'src/modules/flows/utils/time';
import { CreditsManagerService } from 'src/modules/subscriptions/services/credits-manager.service';
import {
	AccountCreditTransactionReason,
	FlowInteractionStatus,
} from 'src/shared/types/db';
import { UnwrapPromise } from 'src/shared/utils/generics';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { createAccountWithSubscription } from 'test/shared/utils/create-account-with-subscription';
import { createFlowForAccount } from 'test/shared/utils/create-flow-for-account';
import { v4 } from 'uuid';

type JobResult = UnwrapPromise<
	ReturnType<
		(typeof FlowCampaignInteractionsQueue)['prototype']['calculateFlowConcurrencyCalls']
	>
>;

jest.mock('src/modules/flows/utils/time', () => {
	const actual = jest.requireActual('src/modules/flows/utils/time');

	return {
		...actual,
		remainingDayFraction: jest.fn(actual.remainingDayFraction),
	};
});
jest.mock('src/modules/flows/utils/concurrency-calls-math');

const mockedRemainingDayFraction = remainingDayFraction as jest.MockedFunction<
	typeof remainingDayFraction
>;
const mockedConcurrencyCallsMath = concurrencyCallsMath as jest.MockedFunction<
	typeof concurrencyCallsMath
>;

describe('Flow Calculate Concurrency Calls Job', () => {
	let environment: TestEnvironment,
		account: account,
		flow: flow,
		agent: flow_agent,
		segment: flow_contact_segment,
		flowsService: FlowsService,
		flowCampaignQueue: Queue<FlowCampaignInteractionsQueueData>,
		creditsManager: CreditsManagerService;

	beforeAll(async () => {
		environment = await setupTestEnvironment();
		flowCampaignQueue = environment.app.get(
			getQueueToken(FLOW_CAMPAIGN_INTERACTIONS_QUEUE),
		);
		flowsService = environment.app.get(FlowsService);
		creditsManager = environment.app.get(CreditsManagerService);

		const accountData = await createAccountWithSubscription(environment, {
			subscriptionPlanInput: {
				name: 'Plan Test',
				allowed_modules: [AccountUsageKind.flow],
			},
			subscriptionPlanPriceInput: {
				monthly_given_balance: new Prisma.Decimal(100),
				flow_minute_cost: new Prisma.Decimal(1),
			},
		});
		account = accountData.account;

		const data = await createFlowForAccount(environment, {
			accountId: account.id,
		});
		flow = data.flow;
		agent = data.agent;
		segment = data.segment;
	});

	const createInteractionForContact = (
		input: Pick<Prisma.flow_interactionUncheckedCreateInput, 'contact'> &
			Partial<Prisma.flow_interactionUncheckedCreateInput>,
	) => {
		return environment.prisma.flow_interaction.create({
			data: {
				id: v4(),
				contact_name: faker.name.firstName(),
				contact_phone: faker.phone.number(),
				status: FlowInteractionStatus.Finished,
				account: account.id,
				agent: agent.id,
				flow: flow.id,
				...input,
			},
		});
	};

	const createContactIntoSegment = async (
		input?: Partial<Prisma.flow_contactUncheckedCreateInput>,
	) => {
		return environment.prisma.flow_contact.create({
			data: {
				id: v4(),
				email: faker.internet.email(),
				first_name: faker.name.firstName(),
				last_name: faker.name.lastName(),
				phone: faker.phone.number(),
				status: FlowContactStatus.active,
				account: account.id,
				flow_contact_flow_contact_segment: {
					create: {
						flow_contact_segment_id: segment.id,
					},
				},
				...input,
			},
		});
	};

	let mockedConcurrencyCallsResult: ReturnType<typeof concurrencyCallsMath>;

	beforeEach(() => {
		mockedConcurrencyCallsMath.mockClear();

		mockedConcurrencyCallsResult = Math.floor(Math.random() * 10);
		mockedConcurrencyCallsMath.mockReturnValueOnce(mockedConcurrencyCallsResult);
	});

	afterAll(async () => {
		await environment.close();
	});

	const addJobAndSharedAsserts = async (): Promise<JobResult> => {
		const job = await flowCampaignQueue.add(FLOW_CALCULATE_CONCURRENCY_CALLS_JOB, {
			flowId: flow.id,
		});

		const result: JobResult = await job.finished();

		expect(result).toEqual(<JobResult>{
			concurrency_calls: mockedConcurrencyCallsResult,
		});
		const updatedFlow = await environment.prisma.flow.findUnique({
			where: {
				id: flow.id,
			},
		});
		expect(updatedFlow!.concurrency_calls).toBe(mockedConcurrencyCallsResult);

		return result;
	};
	const clearEverything = async () => {
		// Delete all interactions
		await environment.prisma.flow_interaction.deleteMany({
			where: {
				account: account.id,
			},
		});

		// Delete all contacts
		await environment.prisma.flow_contact.deleteMany({
			where: {
				account: account.id,
			},
		});
	};

	it('correctly send totalBalance for concurrency calls calculation', async () => {
		await creditsManager.creditForAccount(account.id, {
			amount: new Prisma.Decimal(100),
			reason: AccountCreditTransactionReason.CreditBuy,
		});

		await addJobAndSharedAsserts();

		expect(mockedConcurrencyCallsMath).toHaveBeenCalledWith(
			expect.objectContaining(<Partial<ConcurrencyCallsMathInput>>{
				totalBalance: new Prisma.Decimal(100),
			}),
		);
	});

	it('correctly send dailyBudgetForFlow for concurrency calls calculation', async () => {
		await environment.prisma.flow.update({
			where: { id: flow.id },
			data: {
				daily_budget: 132,
			},
		});
		await addJobAndSharedAsserts();

		expect(mockedConcurrencyCallsMath).toHaveBeenCalledWith(
			expect.objectContaining(<Partial<ConcurrencyCallsMathInput>>{
				dailyBudgetForFlow: 132,
			}),
		);
	});

	it('correctly send cost of interactions today and cost of all interactions', async () => {
		// Create interaction for today
		await createInteractionForContact({
			contact: (await createContactIntoSegment()).id,
			cost: new Prisma.Decimal(3),
		});
		await createInteractionForContact({
			contact: (await createContactIntoSegment()).id,
			cost: new Prisma.Decimal(10),
		});
		const interactionNotToday01 = await createInteractionForContact({
			contact: (await createContactIntoSegment()).id,
			cost: new Prisma.Decimal(2),
		});
		const interactionNotToday02 = await createInteractionForContact({
			contact: (await createContactIntoSegment()).id,
			cost: new Prisma.Decimal(10),
		});

		await environment.prisma.flow_interaction.updateMany({
			where: {
				id: {
					in: [interactionNotToday01.id, interactionNotToday02.id],
				},
			},
			data: {
				date_created: sub(new Date(), { days: 1 }),
			},
		});

		await addJobAndSharedAsserts();

		expect(mockedConcurrencyCallsMath).toHaveBeenCalledWith(
			expect.objectContaining(<Partial<ConcurrencyCallsMathInput>>{
				costOfInteractionsToday: new Prisma.Decimal(13),
				costOfAllInteractions: new Prisma.Decimal(25),
			}),
		);
	});

	it('correctly send total of interactions', async () => {
		await addJobAndSharedAsserts();

		expect(mockedConcurrencyCallsMath).toHaveBeenCalledWith(
			expect.objectContaining(<Partial<ConcurrencyCallsMathInput>>{
				totalInteractionsForFlow: 4,
			}),
		);
	});

	it('correctly send total of interactions with cost', async () => {
		// Create 2 more interactions without cost
		await createInteractionForContact({
			contact: (await createContactIntoSegment()).id,
		});
		await createInteractionForContact({
			contact: (await createContactIntoSegment()).id,
		});

		await addJobAndSharedAsserts();

		expect(mockedConcurrencyCallsMath).toHaveBeenCalledWith(
			expect.objectContaining(<Partial<ConcurrencyCallsMathInput>>{
				totalInteractionsForFlowWithCost: 4,
			}),
		);
	});

	it('correctly send total of answered interactions for flow', async () => {
		await clearEverything();

		// Only in progress and finished should be counted
		await createInteractionForContact({
			contact: (await createContactIntoSegment()).id,
			status: FlowInteractionStatus.InProgress,
		});
		await createInteractionForContact({
			contact: (await createContactIntoSegment()).id,
			status: FlowInteractionStatus.Finished,
		});
		await createInteractionForContact({
			contact: (await createContactIntoSegment()).id,
			status: FlowInteractionStatus.NotAnswered,
		});
		await createInteractionForContact({
			contact: (await createContactIntoSegment()).id,
			status: FlowInteractionStatus.Requested,
		});
		await createInteractionForContact({
			contact: (await createContactIntoSegment()).id,
			status: FlowInteractionStatus.Ringing,
		});

		await addJobAndSharedAsserts();

		expect(mockedConcurrencyCallsMath).toHaveBeenCalledWith(
			expect.objectContaining(<Partial<ConcurrencyCallsMathInput>>{
				totalOfAnsweredInteractionsForFlow: 2,
			}),
		);
	});

	it('correctly send total of ongoing interactions for flow', async () => {
		await clearEverything();

		// Only in requested, progress and ringing should be counted
		await createInteractionForContact({
			contact: (await createContactIntoSegment()).id,
			status: FlowInteractionStatus.InProgress,
		});
		await createInteractionForContact({
			contact: (await createContactIntoSegment()).id,
			status: FlowInteractionStatus.Finished,
		});
		await createInteractionForContact({
			contact: (await createContactIntoSegment()).id,
			status: FlowInteractionStatus.NotAnswered,
		});
		await createInteractionForContact({
			contact: (await createContactIntoSegment()).id,
			status: FlowInteractionStatus.Requested,
		});
		await createInteractionForContact({
			contact: (await createContactIntoSegment()).id,
			status: FlowInteractionStatus.Ringing,
		});

		await addJobAndSharedAsserts();

		expect(mockedConcurrencyCallsMath).toHaveBeenCalledWith(
			expect.objectContaining(<Partial<ConcurrencyCallsMathInput>>{
				totalOfOngoingInteractionsForFlow: 3,
			}),
		);
	});

	it('correctly send percentage of day left', async () => {
		mockedRemainingDayFraction.mockReturnValueOnce(0.57);

		await addJobAndSharedAsserts();

		expect(mockedConcurrencyCallsMath).toHaveBeenCalledWith(
			expect.objectContaining(<Partial<ConcurrencyCallsMathInput>>{
				percentageOfDayLeft: 0.57,
			}),
		);
	});

	it('correctly send cron interval', async () => {
		await addJobAndSharedAsserts();

		expect(mockedConcurrencyCallsMath).toHaveBeenCalledWith(
			expect.objectContaining(<Partial<ConcurrencyCallsMathInput>>{
				cronInterval: flowsService.getCampaignHandlerRepeatCron().inMinutes,
			}),
		);
	});
});
