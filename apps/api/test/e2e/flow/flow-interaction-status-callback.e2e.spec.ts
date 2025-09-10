import { faker } from '@faker-js/faker';
import { flow_interaction } from '@prisma/client';
import { AxiosError } from 'axios';
import { ENV } from 'src/config/env';
import { FlowAgentEditorType } from 'src/graphql';
import { FLOW_CALL_STATUS_CALLBACK_PATH } from 'src/modules/flows/constants/routes';
import { FlowInteractionStatus } from 'src/shared/types/db';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { createAccountWithSubscription } from 'test/shared/utils/create-account-with-subscription';
import * as twilio from 'twilio';
import { v4 } from 'uuid';

describe('Flow Interaction Status Callback', () => {
	let environment: TestEnvironment, interaction: flow_interaction;

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		const { account } = await createAccountWithSubscription(environment);

		const flowAgent = await environment.prisma.flow_agent.create({
			data: {
				id: v4(),
				editor_type: FlowAgentEditorType.advanced,
				title: faker.name.firstName(),
				account: account.id,
			},
		});
		interaction = await environment.prisma.flow_interaction.create({
			data: {
				id: v4(),
				contact_name: faker.name.fullName(),
				contact_phone: faker.phone.number(),
				status: FlowInteractionStatus.Requested,
				account: 550,
				agent: flowAgent.id,
				external_id: faker.datatype.uuid(),
			},
		});
	});

	afterAll(async () => {
		await environment?.close();
	});

	it('should throw unauthorized for invalid signature', async () => {
		await expect(
			environment.httpClient.post(
				FLOW_CALL_STATUS_CALLBACK_PATH.join(''),
				{},
				{
					headers: {
						'x-twilio-signature': 'invalid-signature',
					},
				},
			),
		).rejects.toThrowError(new AxiosError(undefined, '401').message);
	});

	it('update interaction status', async () => {
		const body = {
			CallSid: interaction.external_id,
			CallStatus: 'completed',
		};
		await environment.httpClient.post(FLOW_CALL_STATUS_CALLBACK_PATH.join(''), body, {
			headers: {
				'x-twilio-signature': twilio.getExpectedTwilioSignature(
					ENV.TWILIO.auth_token!,
					ENV.TWILIO.flow_calls_webhooks_url(FLOW_CALL_STATUS_CALLBACK_PATH.join('')),
					body,
				),
			},
		});

		const updatedInteraction = await environment.prisma.flow_interaction.findUnique({
			where: {
				id: interaction.id,
			},
		});

		expect(updatedInteraction?.status).toBe(FlowInteractionStatus.Finished);
	});
});
