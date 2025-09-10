import { faker } from '@faker-js/faker';
import { getQueueToken } from '@nestjs/bull';
import {
	Prisma,
	account,
	flow,
	flow_interaction,
	flow_interaction_recording,
} from '@prisma/client';
import { AxiosError } from 'axios';
import { Queue } from 'bull';
import { ENV } from 'src/config/env';
import { AssetsService } from 'src/modules/assets/services/assets.service';
import { FLOW_CALL_RECORDING_STATUS_CALLBACK_PATH } from 'src/modules/flows/constants/routes';
import {
	FLOW_CALCULATE_CONCURRENCY_CALLS_JOB,
	FLOW_CAMPAIGN_INTERACTIONS_QUEUE,
	FlowCampaignInteractionsQueueData,
} from 'src/modules/flows/queues/flow-interaction.queue';
import {
	FLOW_INTERACTION_RECORD_QUEUE,
	FlowInteractionRecordQueueData,
} from 'src/modules/flows/queues/interaction-recording.queue';
import { CreditsManagerService } from 'src/modules/subscriptions/services/credits-manager.service';
import { FlowInteractionStatus } from 'src/shared/types/db';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { ALL_JOBS_STATUS } from 'test/shared/helpers/queue';
import { createAccountWithSubscription } from 'test/shared/utils/create-account-with-subscription';
import { createFlowForAccount } from 'test/shared/utils/create-flow-for-account';
import * as twilio from 'twilio';
import { v4 } from 'uuid';

describe('Flow Interaction Recording   Status Callback', () => {
	let environment: TestEnvironment,
		interaction: flow_interaction,
		flow: flow,
		account: account,
		queue: Queue<FlowInteractionRecordQueueData>,
		flowCampaignQueue: Queue<FlowCampaignInteractionsQueueData>,
		creditsManager: CreditsManagerService;

	beforeAll(async () => {
		environment = await setupTestEnvironment();
		queue = environment.app.get(getQueueToken(FLOW_INTERACTION_RECORD_QUEUE));
		flowCampaignQueue = environment.app.get(
			getQueueToken(FLOW_CAMPAIGN_INTERACTIONS_QUEUE),
		);
		creditsManager = environment.app.get(CreditsManagerService);

		const accountData = await createAccountWithSubscription(environment, {
			subscriptionPlanPriceInput: {
				flow_minute_cost: new Prisma.Decimal(1),
				monthly_given_balance: new Prisma.Decimal(3),
			},
		});

		account = accountData.account;

		const flowData = await createFlowForAccount(environment, {
			accountId: account.id,
		});
		const flowAgent = flowData.agent;
		flow = flowData.flow;
		interaction = await environment.prisma.flow_interaction.create({
			data: {
				id: v4(),
				contact_name: faker.name.fullName(),
				contact_phone: faker.phone.number(),
				status: FlowInteractionStatus.Requested,
				flow: flow.id,
				account: account.id,
				agent: flowAgent.id,
				external_id: faker.datatype.uuid(),
			},
		});

		await creditsManager.updateCreditGivenByPlanOnPlanChange(
			account.id,
			accountData.planPrice,
		);
	});

	afterAll(async () => {
		await environment?.close();
	});

	it('should throw unauthorized for invalid signature', async () => {
		await expect(
			environment.httpClient.post(
				FLOW_CALL_RECORDING_STATUS_CALLBACK_PATH.join(''),
				{},
				{
					headers: {
						'x-twilio-signature': 'invalid-signature',
					},
				},
			),
		).rejects.toThrowError(new AxiosError(undefined, '401').message);
	});

	it('download interaction, create recording and create usage for account', async () => {
		// See credits before callback
		const { balance } = await creditsManager.totalBalanceForAccount(account.id);
		expect(balance).toEqual(new Prisma.Decimal(3));

		const body = {
			CallSid: interaction.external_id,
			RecordingUrl:
				'',
			RecordingDuration: '110',
		};
		const { data } = await environment.httpClient.post<{ queuedId: string }>(
			FLOW_CALL_RECORDING_STATUS_CALLBACK_PATH.join(''),
			body,
			{
				headers: {
					'x-twilio-signature': twilio.getExpectedTwilioSignature(
						ENV.TWILIO.auth_token!,
						ENV.TWILIO.flow_calls_webhooks_url(
							FLOW_CALL_RECORDING_STATUS_CALLBACK_PATH.join(''),
						),
						body,
					),
				},
			},
		);

		// Await job to finish
		const job = await queue.getJob(data.queuedId);
		await job!.finished();

		const recording = await environment.prisma.flow_interaction_recording.findFirst({
			where: {
				interaction: interaction.id,
			},
		});

		expect(recording).toEqual(<flow_interaction_recording>{
			id: expect.any(String),
			date_created: expect.any(Date),
			account: expect.any(Number),
			// 1 minute and 50 seconds
			// should be 2 minutes in total of cost
			// 1 one cost is 1 credit

			duration: 110,
			date_downloaded: null,
			date_viewed: null,
			file: expect.any(String),
			interaction: interaction.id,
		});

		const file = await environment.prisma.directus_files.findUnique({
			where: {
				id: recording!.file,
			},
		});

		expect(file).toBeDefined();

		const { balance: newBalance } = await creditsManager.totalBalanceForAccount(
			account.id,
		);

		expect(newBalance).toEqual(new Prisma.Decimal(1));

		// Interaction has been updated with the cost
		const updatedInteraction = await environment.prisma.flow_interaction.findUnique({
			where: {
				id: interaction.id,
			},
		});

		expect(updatedInteraction?.cost).toEqual(new Prisma.Decimal(2));

		//Added concurrency calls math job
		const concurrencyCallsJob = (await flowCampaignQueue.getJobs(ALL_JOBS_STATUS)).find(
			(item) =>
				item.name === FLOW_CALCULATE_CONCURRENCY_CALLS_JOB &&
				item.data.flowId === flow.id,
		);

		expect(concurrencyCallsJob).toBeDefined();

		await environment.app.get(AssetsService).deleteFile(file!.id);
	});
});
