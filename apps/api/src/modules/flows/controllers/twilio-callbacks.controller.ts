import { InjectQueue } from '@nestjs/bull';
import { Body, Controller, Post, Req } from '@nestjs/common';
import { Queue } from 'bull';
import { Request } from 'express';
import { ENV } from 'src/config/env';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { TwilioService } from 'src/modules/common/services/twilio.service';
import {
	FLOW_CALL_RECORDING_STATUS_CALLBACK_PATH,
	FLOW_CALL_STATUS_CALLBACK_PATH,
	FLOW_CALL_WEBHOOKS_PATH,
} from '../constants/routes';
import {
	FLOW_INTERACTION_DOWNLOAD_RECORD_JOB,
	FLOW_INTERACTION_RECORD_QUEUE,
	FlowInteractionDownloadRecordJobData,
	FlowInteractionRecordQueueData,
} from '../queues/interaction-recording.queue';
import { normalizeCallStatus } from './normalize';
import {
	TwilioCallStatusCallbackPayload,
	TwilioRecordingStatusCallbackPayload,
} from './types';

@Controller(FLOW_CALL_WEBHOOKS_PATH)
export class FlowCallWebhooksController {
	constructor(
		@InjectQueue(FLOW_INTERACTION_RECORD_QUEUE)
		private readonly queue: Queue<FlowInteractionRecordQueueData>,
		private readonly prisma: PrismaService,
		private readonly twilioService: TwilioService,
	) {}

	@Post(FLOW_CALL_STATUS_CALLBACK_PATH[1])
	async statusCallback(
		@Req() req: Request,
		@Body() data: TwilioCallStatusCallbackPayload,
	) {
		this.twilioService.authCallback({
			body: data,
			req,
			url: ENV.TWILIO.flow_calls_webhooks_url(FLOW_CALL_STATUS_CALLBACK_PATH.join('')),
		});

		const interaction = await this.prisma.flow_interaction.findUnique({
			where: {
				external_id: data.CallSid,
			},
		});

		if (!interaction) return;

		await this.prisma.flow_interaction.update({
			where: {
				id: interaction.id,
			},
			data: {
				status: normalizeCallStatus(data.CallStatus),
			},
		});
	}

	@Post(FLOW_CALL_RECORDING_STATUS_CALLBACK_PATH[1])
	async recordingStatusCallback(
		@Req() req: Request,
		@Body() data: TwilioRecordingStatusCallbackPayload,
	) {
		this.twilioService.authCallback({
			body: data,
			req,
			url: ENV.TWILIO.flow_calls_webhooks_url(
				FLOW_CALL_RECORDING_STATUS_CALLBACK_PATH.join(''),
			),
		});

		const interaction = await this.prisma.flow_interaction.findFirst({
			where: {
				external_id: data.CallSid,
			},
		});

		if (!interaction) return;

		const { id } = await this.queue.add(
			FLOW_INTERACTION_DOWNLOAD_RECORD_JOB,
			<FlowInteractionDownloadRecordJobData>{
				downloadUrl: data.RecordingUrl,
				durationInSeconds: Number(data.RecordingDuration),
				interactionId: interaction.id,
			},
			{
				attempts: 3,
			},
		);

		return {
			queuedId: id,
		};
	}
}
