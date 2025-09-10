import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Inject, forwardRef } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { CONSTANTS } from 'src/config/constants';
import { ENV } from 'src/config/env';
import { AccountUsageKind } from 'src/graphql';
import { AssetsService } from 'src/modules/assets/services/assets.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { UsageManagerService } from 'src/modules/subscriptions/services/usage-manager.service';
import { v4 } from 'uuid';
import {
	FLOW_CALCULATE_CONCURRENCY_CALLS_JOB,
	FLOW_CAMPAIGN_INTERACTIONS_QUEUE,
	FlowCalculateConcurrencyCallsJob,
	FlowCampaignInteractionsQueueData,
} from './flow-interaction.queue';

export const FLOW_INTERACTION_RECORD_QUEUE = 'flow-interaction-record-queue';
export const FLOW_INTERACTION_DOWNLOAD_RECORD_JOB =
	'flow-interaction-download-record-job';

export type FlowInteractionDownloadRecordJobData = {
	interactionId: string;
	downloadUrl: string;
	durationInSeconds: number;
};
export type FlowInteractionRecordQueueData = FlowInteractionDownloadRecordJobData;

@Processor(FLOW_INTERACTION_RECORD_QUEUE)
export class InteractionRecordingQueue {
	constructor(
		private readonly prisma: PrismaService,
		private readonly assetsService: AssetsService,
		@Inject(forwardRef(() => UsageManagerService))
		private readonly usageManager: UsageManagerService,
		@InjectQueue(FLOW_CAMPAIGN_INTERACTIONS_QUEUE)
		private readonly campaignQueue: Queue<FlowCampaignInteractionsQueueData>,
	) {}

	@Process(FLOW_INTERACTION_DOWNLOAD_RECORD_JOB)
	async downloadRecord(job: Job<FlowInteractionDownloadRecordJobData>) {
		const { downloadUrl, interactionId, durationInSeconds } = job.data;

		const interaction = await this.prisma.flow_interaction.findUniqueOrThrow({
			where: {
				id: interactionId,
			},
		});

		job.progress(33);

		const file = await this.assetsService.uploadFromUrl({
			url: downloadUrl,
			folder: await this.assetsService.getDirectusFolder(
				CONSTANTS.ASSETS_FOLDERS.flow_call_recording,
			),
			type: 'mp3',
			requestConfig: {
				auth: {
					username: ENV.TWILIO.account_sid!,
					password: ENV.TWILIO.auth_token!,
				},
			},
		});

		job.progress(66);

		const data = await this.prisma.$transaction(async (trx) => {
			const recording = await trx.flow_interaction_recording.create({
				data: {
					id: v4(),
					duration: durationInSeconds,
					account: interaction.account,
					file: file.id,
					interaction: interaction.id,
				},
			});

			const { totalCost } = await this.usageManager.createAccountUsageForOperation(
				interaction.account,
				AccountUsageKind.flow,
				// minutes to seconds rounded to the next minute
				Math.ceil(durationInSeconds / 60),
			);

			await trx.flow_interaction.update({
				where: {
					id: interaction.id,
				},
				data: {
					cost: totalCost,
				},
			});

			return { recording, totalCost };
		});
		if (interaction.flow) {
			await this.campaignQueue.add(
				FLOW_CALCULATE_CONCURRENCY_CALLS_JOB,
				<FlowCalculateConcurrencyCallsJob>{
					flowId: interaction.flow,
				},
				{},
			);
		}

		job.progress(100);

		return data;
	}
}
