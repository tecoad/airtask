import { CronExpression } from '@nestjs/schedule';
import { flow_agent, flow_contact_segment } from '@prisma/client';
import { Job } from 'bull';
import { FlowAgentEditorType } from 'src/graphql';
import * as allImportsFromQueue from 'src/modules/flows/queues/flow-interaction.queue';
import { FlowsService } from 'src/modules/flows/services/flows.service';
import { Sleep } from 'src/shared/utils/any';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { CREATE_FLOW, DELETE_FLOW, UPDATE_FLOW } from 'test/shared/gql/private/flow';
import {
	AccountRole,
	AccountUsageKind,
	CreateFlowInput,
	CreateFlowMutation,
	CreateFlowMutationVariables,
	DeleteFlowMutation,
	DeleteFlowMutationVariables,
	FlowFragment,
	FlowStatus,
	FlowType,
	UpdateFlowMutation,
	UpdateFlowMutationVariables,
} from 'test/shared/test-gql-private-api-schema.ts';
import { UserWithAccounts } from 'test/shared/utils/create-user-as-account-owner';
import { createUserAsAccountMemberWithSubscription } from 'test/shared/utils/create-user-as-account-with-subscription-member';
import { v4 } from 'uuid';

// Change campaignHandlerRepeatCron to every second to test the cron
jest.spyOn(FlowsService.prototype, 'getCampaignHandlerRepeatCron').mockReturnValue({
	cron: CronExpression.EVERY_SECOND,
	inMinutes: 5,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleCampaignJobFn = jest.fn((job: Job) => ({}));
jest
	.spyOn(allImportsFromQueue, 'onFlowHandleCampaignJobRepeat')
	.mockImplementation(handleCampaignJobFn);

/**
 * This suit only tests the creation and removal of the repeatable job,
 * not the job itself
 */
describe('Flow Schedule Repeatable Campaign Job', () => {
	let user: UserWithAccounts,
		accountId: number,
		flowAgent: flow_agent,
		flowContactSegment: flow_contact_segment,
		environment: TestEnvironment;

	beforeAll(async () => {
		environment = await setupTestEnvironment();
		user = await createUserAsAccountMemberWithSubscription(environment, {
			accountUserInput: {
				role: AccountRole.Owner,
			},
			subscriptionInput: {},
			subscriptionPlanInput: {
				name: 'Plan',
				allowed_modules: [AccountUsageKind.Flow],
			},
		});

		accountId = user.account_user[0].account_id!;

		flowAgent = await environment.prisma.flow_agent.create({
			data: {
				id: v4(),
				account: accountId,
				editor_type: FlowAgentEditorType.advanced,
				title: 'Title',
			},
		});
		flowContactSegment = await environment.prisma.flow_contact_segment.create({
			data: {
				id: v4(),
				account: accountId,
				label: 'Label',
			},
		});

		environment.privateApiClient.authenticateAsUser(user.id, user.email);
	});

	afterAll(async () => {
		await environment.close();
	});

	let createInput: CreateFlowInput;

	it('does not create a repeatable job when flow is not outbound', async () => {
		createInput = {
			account: accountId,
			agent: flowAgent.id,
			segment: flowContactSegment.id,
			name: 'Name',
			type: FlowType.Inbound,
			daily_budget: 2.53,
			status: FlowStatus.Active,
		};

		await environment.privateApiClient.query<
			CreateFlowMutation,
			CreateFlowMutationVariables
		>(CREATE_FLOW, {
			input: createInput,
		});

		// Wait 2 seconds to make sure the job is not created
		await Sleep(1000);
		expect(handleCampaignJobFn).not.toHaveBeenCalled();
	});

	it('does not create a repeatable job when status is not active', async () => {
		createInput.status = FlowStatus.Paused;
		createInput.type = FlowType.Outbound;

		await environment.privateApiClient.query<
			CreateFlowMutation,
			CreateFlowMutationVariables
		>(CREATE_FLOW, {
			input: createInput,
		});

		// Wait 2 seconds to make sure the job is not created
		await Sleep(1000);
		expect(handleCampaignJobFn).not.toHaveBeenCalled();
	});

	let createdFlow: FlowFragment;

	it('creates a repeatable job when flow is outbound', async () => {
		createInput.status = FlowStatus.Active;
		createInput.type = FlowType.Outbound;

		const { data } = await environment.privateApiClient.query<
			CreateFlowMutation,
			CreateFlowMutationVariables
		>(CREATE_FLOW, {
			input: createInput,
		});
		createdFlow = data.createFlow;

		await Sleep(1000);
		expect(handleCampaignJobFn).toHaveBeenCalled();
	});

	it('removes the repeatable job when flow is updated to another status', async () => {
		await environment.privateApiClient.query<
			UpdateFlowMutation,
			UpdateFlowMutationVariables
		>(UPDATE_FLOW, {
			input: {
				id: createdFlow.id,
				status: FlowStatus.Paused,
			},
		});

		// Clear the mock calls
		handleCampaignJobFn.mockClear();

		await Sleep(3000);
		expect(handleCampaignJobFn).not.toHaveBeenCalled();
	});

	it('creates a repeatable job again when flow is updated to active', async () => {
		await environment.privateApiClient.query<
			UpdateFlowMutation,
			UpdateFlowMutationVariables
		>(UPDATE_FLOW, {
			input: {
				id: createdFlow.id,
				status: FlowStatus.Active,
			},
		});

		await Sleep(1000);
		expect(handleCampaignJobFn).toHaveBeenCalled();
	});

	it('removes the repeatable job when flow is deleted', async () => {
		await environment.privateApiClient.query<
			DeleteFlowMutation,
			DeleteFlowMutationVariables
		>(DELETE_FLOW, {
			deleteFlowId: createdFlow.id,
		});

		// Clear the mock calls
		handleCampaignJobFn.mockClear();

		await Sleep(1000);
		expect(handleCampaignJobFn).not.toHaveBeenCalled();
	});
});
