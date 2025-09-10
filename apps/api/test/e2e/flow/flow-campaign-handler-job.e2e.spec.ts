import { faker } from '@faker-js/faker';
import { getQueueToken } from '@nestjs/bull';
import { CronExpression } from '@nestjs/schedule';
import {
	Prisma,
	account,
	flow,
	flow_contact,
	flow_contact_segment,
	flow_interaction,
	subscription_plan_price,
} from '@prisma/client';
import { Job, Queue } from 'bull';
import { sub, subDays } from 'date-fns';
import { when } from 'jest-when';
import { getLocalInfo } from 'phone-number-to-timezone';
import { AccountUsageKind, FlowContactStatus, FlowStatus, FlowType } from 'src/graphql';
import {
	FLOW_CAMPAIGN_INTERACTIONS_QUEUE,
	FlowCampaignInteractionsQueue,
	FlowCampaignInteractionsQueueData,
	FlowCreateInteractionJobData,
	replaceCreateInteractionJob,
} from 'src/modules/flows/queues/flow-interaction.queue';
import { FlowsService } from 'src/modules/flows/services/flows.service';
import { GetLocalInfoReturn } from 'src/modules/flows/types';
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
import { ALL_JOBS_STATUS } from 'test/shared/helpers/queue';
import { createAccountWithSubscription } from 'test/shared/utils/create-account-with-subscription';
import { createFlowForAccount } from 'test/shared/utils/create-flow-for-account';
import { v4 } from 'uuid';

// Starts with the original function
jest.mock('phone-number-to-timezone', () => {
	const original = jest.requireActual('phone-number-to-timezone');

	return {
		original,
		getLocalInfo: jest.fn(original.getLocalInfo),
	};
});

jest.spyOn(FlowsService.prototype, 'getCampaignHandlerRepeatCron').mockReturnValue({
	cron: CronExpression.EVERY_5_SECONDS,
	inMinutes: 5,
});

type JobResult = UnwrapPromise<
	ReturnType<(typeof FlowCampaignInteractionsQueue)['prototype']['handleCampaignJob']>
>;

const makePhonePassInTimeZone = (phone: string) => {
	when(getLocalInfo)
		.calledWith(phone)
		.mockReturnValue(<GetLocalInfoReturn>{
			time: {
				hour: '10',
			},
		});
};

describe('Flow Campaign Handler Job', () => {
	let environment: TestEnvironment,
		account: account,
		accountSubscriptionPlanPrice: subscription_plan_price,
		flow: flow,
		flowSegment: flow_contact_segment,
		flowService: FlowsService,
		creditsManager: CreditsManagerService,
		flowCampaignQueue: Queue<FlowCampaignInteractionsQueueData>;

	const createTheFlow = async () => {
		const data = await createFlowForAccount(environment, {
			accountId: account.id,
		});

		flow = data.flow;
		flowSegment = data.segment;
	};

	const createInteractionForContact = (
		input: Pick<
			Prisma.flow_interactionUncheckedCreateInput,
			'flow' | 'agent' | 'contact'
		> &
			Partial<Prisma.flow_interactionUncheckedCreateInput>,
	) => {
		return environment.prisma.flow_interaction.create({
			data: {
				id: v4(),
				contact_name: faker.name.firstName(),
				contact_phone: faker.phone.number(),
				status: FlowInteractionStatus.Finished,
				account: account.id,
				...input,
			},
		});
	};

	const createInteractionJobMock = jest.fn(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		async (job: Job<FlowCreateInteractionJobData>) => ({}),
	);

	beforeAll(async () => {
		environment = await setupTestEnvironment();
		flowService = environment.app.get(FlowsService);
		creditsManager = environment.app.get(CreditsManagerService);
		flowCampaignQueue = environment.app.get(
			getQueueToken(FLOW_CAMPAIGN_INTERACTIONS_QUEUE),
		);

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
		accountSubscriptionPlanPrice = accountData.planPrice;

		await createTheFlow();

		// In this suit we are not testing this job. So, this job will be mocked
		// to just craeted a interaction as Finished.
		replaceCreateInteractionJob(createInteractionJobMock);
	});

	afterAll(async () => {
		await environment.close();
	});

	const waitUntilDate = (date: number) => {
		return new Promise((resolve) => {
			const interval = setInterval(() => {
				if (Date.now() >= date) {
					clearInterval(interval);

					resolve(true);
				}
			}, 0);
		});
	};

	const getNextRepeatDate = async (flowWithQueue: flow) => {
		const queueData = flowService.getQueueData(flowWithQueue);
		const repeatable = (await flowCampaignQueue.getRepeatableJobs()).find(
			(item) => item.key === queueData.handleCampaignJob?.repeat.key,
		)!;

		if (!repeatable) {
			return;
		}

		await waitUntilDate(repeatable.next + 10);

		const jobs = await flowCampaignQueue.getJobs(ALL_JOBS_STATUS);
		const job = jobs.find((item) => item.opts.repeat?.key === repeatable.key);

		return job;
	};

	const createOneExecutionOfRepeatable = async () => {
		// Set up repeatable job
		const flowWithQueue = await flowService.addCampaignHandler(flow, {
			maxOfRepeats: 1,
		});
		const job = await getNextRepeatDate(flowWithQueue);
		// Before it finish, remove the repeatable job
		await flowService.removeCampaignHandler(flowWithQueue);

		// Wait it to be finised
		const result: JobResult = await job!.finished();

		return {
			result,
		};
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
						flow_contact_segment_id: flowSegment.id,
					},
				},
				...input,
			},
		});
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

	describe('Checks to keep a campaign active', () => {
		it.each([
			['updated_to_stopped'] as const,
			['updated_to_paused'] as const,
			['type_change_to_inbound'] as const,
			['deleted'] as const,
		])(
			'the job removes itself from the queue when flow was %s',
			async (flowTestAction) => {
				const executeAction = async () => {
					switch (flowTestAction) {
						case 'updated_to_paused':
							await environment.prisma.flow.update({
								where: { id: flow.id },
								data: { status: FlowStatus.paused },
							});
							return async () => {
								flow = await environment.prisma.flow.update({
									where: { id: flow.id },
									data: { status: FlowStatus.active },
								});
							};
						case 'updated_to_stopped':
							await environment.prisma.flow.update({
								where: { id: flow.id },
								data: { status: FlowStatus.stopped },
							});
							return async () => {
								flow = await environment.prisma.flow.update({
									where: { id: flow.id },
									data: { status: FlowStatus.active },
								});
							};
						case 'type_change_to_inbound':
							await environment.prisma.flow.update({
								where: { id: flow.id },
								data: { type: FlowType.inbound },
							});
							return async () => {
								flow = await environment.prisma.flow.update({
									where: { id: flow.id },
									data: { type: FlowType.outbound },
								});
							};
						case 'deleted':
							await environment.prisma.flow.delete({
								where: { id: flow.id },
							});
							return createTheFlow;
					}
				};
				const flowWithQueue = await flowService.addCampaignHandler(flow);
				const backToNormal = await executeAction();

				const job = (await getNextRepeatDate(flowWithQueue))!;

				expect(job).toBeDefined();

				const result: JobResult = await job.finished();

				expect(result).toEqual(<JobResult>{
					stopReason: 'flow_is_not_active',
					hasRemovedPermanently: true,
				});

				expect(createInteractionJobMock).not.toHaveBeenCalled();

				const secondRun = await getNextRepeatDate(flowWithQueue);

				expect(secondRun).toBeUndefined();

				await backToNormal();
			},
		);
	});

	describe('Checks to cancel the current campaign handler run', () => {
		beforeAll(async () => {
			await clearEverything();
		});

		it('the job stops it run but not the next if account is not allowed to perform operation', async () => {
			// We start this suit without any credits, so we don't need to do anything
			// to get the expected behavior

			const flowWithQueue = await flowService.addCampaignHandler(flow);

			const job = (await getNextRepeatDate(flowWithQueue))!;

			expect(job).toBeDefined();

			const result: JobResult = await job.finished();

			expect(result).toEqual(<JobResult>{
				stopReason: 'account_is_not_allowed_to_perform_operation',
				hasRemovedPermanently: false,
			});
			expect(createInteractionJobMock).not.toHaveBeenCalled();

			const secondRun = await getNextRepeatDate(flowWithQueue);

			// Next run occur
			expect(secondRun).toBeDefined();

			await secondRun?.finished();

			// Remove campaign for next suits
			await flowService.removeCampaignHandler(flowWithQueue);
		});

		const createdInteractions: flow_interaction[] = [];

		it('the job stops it run but not the next if flow reached the exactly daily budget', async () => {
			// Credit to not repeat the rule from the last test
			await creditsManager.creditForAccount(account.id, {
				amount: accountSubscriptionPlanPrice.flow_minute_cost!,
				reason: AccountCreditTransactionReason.CreditBuy,
			});

			await environment.prisma.flow.update({
				where: { id: flow.id },
				data: { daily_budget: 2 },
			});

			// Create 2 interactions for the flow
			const contact01 = await createContactIntoSegment();
			const interaction01 = await createInteractionForContact({
				flow: flow.id,
				agent: flow.agent,
				contact: contact01.id,
				status: FlowInteractionStatus.Finished,
				cost: new Prisma.Decimal(1),
			});

			const contact02 = await createContactIntoSegment();
			const interaction02 = await createInteractionForContact({
				flow: flow.id,
				agent: flow.agent,
				contact: contact02.id,
				status: FlowInteractionStatus.Finished,
				cost: new Prisma.Decimal(1),
			});

			createdInteractions.push(interaction01, interaction02);

			const flowWithQueue = await flowService.addCampaignHandler(flow);

			const job = (await getNextRepeatDate(flowWithQueue))!;

			expect(job).toBeDefined();

			const result: JobResult = await job.finished();

			expect(result).toEqual(<JobResult>{
				stopReason: 'flow_reached_daily_budget',
				hasRemovedPermanently: false,
			});
			expect(createInteractionJobMock).not.toHaveBeenCalled();

			const secondRun = await getNextRepeatDate(flowWithQueue);

			// Next run occur
			expect(secondRun).toBeDefined();

			await secondRun?.finished();

			// Remove campaign for next suits
			await flowService.removeCampaignHandler(flowWithQueue);
		});

		it('the job stops it run but not the next if flow spent more then daily budget', async () => {
			// Credit to not repeat the rule from the last test
			await creditsManager.creditForAccount(account.id, {
				amount: accountSubscriptionPlanPrice.flow_minute_cost!,
				reason: AccountCreditTransactionReason.CreditBuy,
			});

			await environment.prisma.flow.update({
				where: { id: flow.id },
				data: { daily_budget: 1.5 },
			});

			const flowWithQueue = await flowService.addCampaignHandler(flow);

			const job = (await getNextRepeatDate(flowWithQueue))!;

			expect(job).toBeDefined();

			const result: JobResult = await job.finished();

			expect(result).toEqual(<JobResult>{
				stopReason: 'flow_reached_daily_budget',
				hasRemovedPermanently: false,
			});
			expect(createInteractionJobMock).not.toHaveBeenCalled();

			const secondRun = await getNextRepeatDate(flowWithQueue);

			// Next run occur
			expect(secondRun).toBeDefined();

			await secondRun?.finished();

			// Remove campaign for next suits
			await flowService.removeCampaignHandler(flowWithQueue);
		});

		it('the job runs if the interacions that crossed the daily budget wasnt created today', async () => {
			await environment.prisma.flow_interaction.update({
				where: {
					id: createdInteractions[0].id,
				},
				data: {
					date_created: subDays(new Date(), 1),
				},
			});

			const { result } = await createOneExecutionOfRepeatable();

			expect(result).toEqual(<JobResult>{
				// we are not testing the interactions created, so we dont care about the number
				contactsAddedToQueue: expect.any(Number),
				contactsThatNotPassedTheRules: expect.any(Array),
			});
		});
	});

	describe('Contact status and concurrency calls', () => {
		beforeAll(async () => {
			// make sure account has enough credits
			await creditsManager.creditForAccount(account.id, {
				amount: accountSubscriptionPlanPrice.flow_minute_cost!,
				reason: AccountCreditTransactionReason.CreditBuy,
			});
			await clearEverything();
		});

		const makeContactPassInAlRules = (contact: flow_contact) => {
			makePhonePassInTimeZone(contact.phone);
		};

		const createdContacts: flow_contact[] = [];
		const createdInteractions: flow_interaction[] = [];

		it('calls all active contacts from segments', async () => {
			await environment.prisma.flow.update({
				where: { id: flow.id },
				data: { concurrency_calls: 100 },
			});

			const contact01 = await createContactIntoSegment();
			const contact02 = await createContactIntoSegment();
			const contact03 = await createContactIntoSegment();

			makeContactPassInAlRules(contact01);
			makeContactPassInAlRules(contact02);
			makeContactPassInAlRules(contact03);

			createdContacts.push(contact01, contact02, contact03);

			await environment.prisma.flow_contact.update({
				where: { id: contact01.id },
				data: { status: FlowContactStatus.inactive },
			});

			const { result } = await createOneExecutionOfRepeatable();

			expect(result).toEqual(<JobResult>{
				contactsAddedToQueue: 2,
				contactsThatNotPassedTheRules: [],
			});

			expect(createInteractionJobMock).not.toHaveBeenCalledWith(
				expect.objectContaining(<Job<FlowCreateInteractionJobData>>{
					data: {
						contactId: contact01.id,
						flowId: flow.id,
					},
				}),
			);
			expect(createInteractionJobMock).toHaveBeenCalledWith(
				expect.objectContaining(<Job<FlowCreateInteractionJobData>>{
					data: {
						contactId: contact02.id,
						flowId: flow.id,
					},
				}),
			);
			expect(createInteractionJobMock).toHaveBeenCalledWith(
				expect.objectContaining(<Job<FlowCreateInteractionJobData>>{
					data: {
						contactId: contact03.id,
						flowId: flow.id,
					},
				}),
			);
		});

		it('calls less contacts then concurrency_calls without going on interactions', async () => {
			createInteractionJobMock.mockClear();
			await environment.prisma.flow.update({
				where: { id: flow.id },
				data: { concurrency_calls: 2 },
			});

			const [contact01, contact02, contact03] = createdContacts;

			makeContactPassInAlRules(contact01);
			makeContactPassInAlRules(contact02);
			makeContactPassInAlRules(contact03);

			createInteractionJobMock.mockClear();
			const { result } = await createOneExecutionOfRepeatable();

			expect(result).toEqual(<JobResult>{
				contactsAddedToQueue: 2,
				contactsThatNotPassedTheRules: [],
			});

			expect(createInteractionJobMock).toHaveBeenCalledTimes(2);
		});

		it('calls less contacts then concurrency_calls considering going on interactions', async () => {
			createInteractionJobMock.mockClear();
			// Now there is 4 max of concurrency calls
			await environment.prisma.flow.update({
				where: { id: flow.id },
				data: { concurrency_calls: 4 },
			});

			const [contact01, contact02, contact03] = createdContacts;

			// Create 2 contacts that will be in interactions going on
			// but this both would not pass in the rules
			// because the interaction was created less then one hour ago
			const contact04 = await createContactIntoSegment();
			const interactionForContact04 = await createInteractionForContact({
				agent: flow.agent,
				flow: flow.id,
				contact: contact04.id,
				status: FlowInteractionStatus.InProgress,
			});
			const contact05 = await createContactIntoSegment();
			const interactionForContact05 = await createInteractionForContact({
				agent: flow.agent,
				flow: flow.id,
				contact: contact05.id,
				status: FlowInteractionStatus.InProgress,
			});
			createdInteractions.push(interactionForContact04, interactionForContact05);

			// So we create another 2 contacts that will pass in the rules but also should not be called
			// because the concurrency calls is 4 and we have 2 interactions going on
			// and 5 contacts that will pass in all the rules.
			// Meaning that only 2 contacts should be called
			const contact06 = await createContactIntoSegment();
			const contact07 = await createContactIntoSegment();
			makeContactPassInAlRules(contact01);
			makeContactPassInAlRules(contact02);
			makeContactPassInAlRules(contact03);
			makeContactPassInAlRules(contact04);
			makeContactPassInAlRules(contact05);
			makeContactPassInAlRules(contact06);
			makeContactPassInAlRules(contact07);

			createdContacts.push(contact04, contact05, contact06, contact07);
			createInteractionJobMock.mockClear();

			const { result } = await createOneExecutionOfRepeatable();

			expect(result).toEqual(<JobResult>{
				contactsAddedToQueue: 2,
				contactsThatNotPassedTheRules: [
					{
						contactId: contact04.id,
						ruleName: 'contact_has_been_called_in_the_last_hour',
					},
					{
						contactId: contact05.id,
						ruleName: 'contact_has_been_called_in_the_last_hour',
					},
				],
			});

			expect(createInteractionJobMock).toHaveBeenCalledTimes(2);
		});

		// this suit is pretty much the same as the last one, but the intereactions
		// are set as finished, and should not be considered as going on interactions
		it('calls less contacts then concurrency_calls and not consider finished interactions as going on interactions', async () => {
			createInteractionJobMock.mockClear();
			// Now there is 4 max of concurrency calls
			await environment.prisma.flow.update({
				where: { id: flow.id },
				data: { concurrency_calls: 4 },
			});

			// Update interactions to be finished
			await environment.prisma.flow_interaction.updateMany({
				where: {
					id: {
						in: createdInteractions.map((item) => item.id),
					},
				},
				data: {
					status: FlowInteractionStatus.Finished,
				},
			});

			const { result } = await createOneExecutionOfRepeatable();

			expect(result).toEqual(<JobResult>{
				contactsAddedToQueue: 4,
				contactsThatNotPassedTheRules: [
					{
						contactId: createdContacts[3].id,
						ruleName: 'contact_has_been_called_in_the_last_hour',
					},
					{
						contactId: createdContacts[4].id,
						ruleName: 'contact_has_been_called_in_the_last_hour',
					},
				],
			});

			expect(createInteractionJobMock).toHaveBeenCalledTimes(4);
		});

		// this suit is pretty much the same as the last one, but the intereactions
		// are set as not answered, and should not be considered as going on interactions
		it('calls less contacts then concurrency_calls and not consider not answered interactions as going on interactions', async () => {
			createInteractionJobMock.mockClear();
			// Now there is 4 max of concurrency calls
			await environment.prisma.flow.update({
				where: { id: flow.id },
				data: { concurrency_calls: 4 },
			});

			// Update interactions to be finished
			await environment.prisma.flow_interaction.updateMany({
				where: {
					id: {
						in: createdInteractions.map((item) => item.id),
					},
				},
				data: {
					status: FlowInteractionStatus.NotAnswered,
				},
			});

			const { result } = await createOneExecutionOfRepeatable();

			expect(result).toEqual(<JobResult>{
				contactsAddedToQueue: 4,
				contactsThatNotPassedTheRules: [
					{
						contactId: createdContacts[3].id,
						ruleName: 'contact_has_been_called_in_the_last_hour',
					},
					{
						contactId: createdContacts[4].id,
						ruleName: 'contact_has_been_called_in_the_last_hour',
					},
				],
			});

			expect(createInteractionJobMock).toHaveBeenCalledTimes(4);
		});
	});

	describe('Contact individual call rules', () => {
		beforeAll(async () => {
			// make sure account has enough credits
			await creditsManager.creditForAccount(account.id, {
				amount: accountSubscriptionPlanPrice.flow_minute_cost!,
				reason: AccountCreditTransactionReason.CreditBuy,
			});

			await environment.prisma.flow.update({
				where: {
					id: flow.id,
				},
				data: {
					concurrency_calls: 100,
				},
			});

			await clearEverything();

			createInteractionJobMock.mockClear();
		});

		beforeEach(async () => {
			await clearEverything();
			createInteractionJobMock.mockClear();
		});

		it('dont call a contact that is in a current time less than time range', async () => {
			const contact = await createContactIntoSegment();

			when(getLocalInfo)
				.calledWith(contact.phone)
				.mockReturnValue(<GetLocalInfoReturn>{
					time: {
						hour: '7',
					},
				});

			const { result } = await createOneExecutionOfRepeatable();

			expect(result).toEqual(<JobResult>{
				contactsAddedToQueue: 0,
				contactsThatNotPassedTheRules: [
					{
						contactId: contact.id,
						ruleName: 'phone_is_not_in_time_range',
					},
				],
			});

			expect(createInteractionJobMock).not.toHaveBeenCalled();
		});

		it('dont call a contact that is in a current time greater than time range', async () => {
			const contact = await createContactIntoSegment();

			when(getLocalInfo)
				.calledWith(contact.phone)
				.mockReturnValue(<GetLocalInfoReturn>{
					time: {
						hour: '21',
					},
				});

			const { result } = await createOneExecutionOfRepeatable();

			expect(result).toEqual(<JobResult>{
				contactsAddedToQueue: 0,
				contactsThatNotPassedTheRules: [
					{
						contactId: contact.id,
						ruleName: 'phone_is_not_in_time_range',
					},
				],
			});

			expect(createInteractionJobMock).not.toHaveBeenCalled();
		});

		it('dont call a contact that was called in the last hour', async () => {
			const contact = await createContactIntoSegment();
			makePhonePassInTimeZone(contact.phone);

			// Create a interaction that was created in the last hour
			const interaction = await createInteractionForContact({
				agent: flow.agent,
				flow: flow.id,
				contact: contact.id,
				status: FlowInteractionStatus.Finished,
			});
			await environment.prisma.flow_interaction.update({
				where: { id: interaction.id },
				data: {
					date_created: sub(new Date(), {
						minutes: 59,
					}),
				},
			});

			const { result } = await createOneExecutionOfRepeatable();

			expect(result).toEqual(<JobResult>{
				contactsAddedToQueue: 0,
				contactsThatNotPassedTheRules: [
					{
						contactId: contact.id,
						ruleName: 'contact_has_been_called_in_the_last_hour',
					},
				],
			});

			expect(createInteractionJobMock).not.toHaveBeenCalled();
		});

		it('dont call a contact that was called in the last hour even if the last interaction was not finished', async () => {
			const contact = await createContactIntoSegment();
			makePhonePassInTimeZone(contact.phone);

			// Create a interaction that was created in the last hour
			const interaction = await createInteractionForContact({
				agent: flow.agent,
				flow: flow.id,
				contact: contact.id,
				status: FlowInteractionStatus.InProgress,
				date_created: sub(new Date(), {
					minutes: 59,
				}),
			});
			await environment.prisma.flow_interaction.update({
				where: { id: interaction.id },
				data: {
					date_created: sub(new Date(), {
						minutes: 59,
					}),
				},
			});

			const { result } = await createOneExecutionOfRepeatable();

			expect(result).toEqual(<JobResult>{
				contactsAddedToQueue: 0,
				contactsThatNotPassedTheRules: [
					{
						contactId: contact.id,
						ruleName: 'contact_has_been_called_in_the_last_hour',
					},
				],
			});

			expect(createInteractionJobMock).not.toHaveBeenCalled();
		});

		it('call a contact if the last interaction was created more than one hour ago', async () => {
			const contact = await createContactIntoSegment();
			makePhonePassInTimeZone(contact.phone);

			// Create a interaction that was created in the last hour
			const interaction = await createInteractionForContact({
				agent: flow.agent,
				flow: flow.id,
				contact: contact.id,
				status: FlowInteractionStatus.InProgress,
			});
			await environment.prisma.flow_interaction.update({
				where: { id: interaction.id },
				data: {
					date_created: sub(new Date(), {
						minutes: 1,
						hours: 1,
					}),
				},
			});

			const { result } = await createOneExecutionOfRepeatable();

			expect(result).toEqual(<JobResult>{
				contactsAddedToQueue: 1,
				contactsThatNotPassedTheRules: [],
			});

			expect(createInteractionJobMock).toHaveBeenCalledWith(
				expect.objectContaining(<Job<FlowCreateInteractionJobData>>{
					data: {
						contactId: contact.id,
						flowId: flow.id,
					},
				}),
			);
			expect(createInteractionJobMock).toHaveBeenCalledTimes(1);
		});

		it('dont call a contact if has finished a interaction already', async () => {
			const contact = await createContactIntoSegment();
			makePhonePassInTimeZone(contact.phone);

			// Create a interaction that was created in the last hour
			const interaction = await createInteractionForContact({
				agent: flow.agent,
				flow: flow.id,
				contact: contact.id,
				status: FlowInteractionStatus.Finished,
			});
			// IMPORTANT: Update this otherwise the interaction will be considered as
			// going on interaction and will never get on the rule we are trying to test in here
			await environment.prisma.flow_interaction.update({
				where: { id: interaction.id },
				data: {
					date_created: sub(new Date(), {
						minutes: 1,
						hours: 1,
					}),
				},
			});

			const { result } = await createOneExecutionOfRepeatable();

			expect(result).toEqual(<JobResult>{
				contactsAddedToQueue: 0,
				contactsThatNotPassedTheRules: [
					{
						contactId: contact.id,
						ruleName: 'contact_has_finished_a_interaction_already',
					},
				],
			});

			expect(createInteractionJobMock).not.toHaveBeenCalled();
		});

		it('call a contact if has not finished a interaction already', async () => {
			const contact = await createContactIntoSegment();
			makePhonePassInTimeZone(contact.phone);

			// Create a interaction that was created in the last hour
			const interaction = await createInteractionForContact({
				agent: flow.agent,
				flow: flow.id,
				contact: contact.id,
				status: FlowInteractionStatus.NotAnswered,
			});
			// IMPORTANT: Update this otherwise the interaction will be considered as
			// going on interaction and will never get on the rule we are trying to test in here
			await environment.prisma.flow_interaction.update({
				where: { id: interaction.id },
				data: {
					date_created: sub(new Date(), {
						minutes: 1,
						hours: 1,
					}),
				},
			});

			const { result } = await createOneExecutionOfRepeatable();

			expect(result).toEqual(<JobResult>{
				contactsAddedToQueue: 1,
				contactsThatNotPassedTheRules: [],
			});

			expect(createInteractionJobMock).toHaveBeenCalledWith(
				expect.objectContaining(<Job<FlowCreateInteractionJobData>>{
					data: {
						contactId: contact.id,
						flowId: flow.id,
					},
				}),
			);
			expect(createInteractionJobMock).toHaveBeenCalledTimes(1);
		});
	});
});
