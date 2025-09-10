import { getQueueToken } from '@nestjs/bull';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { flow } from '@prisma/client';
import { ValidationError } from 'apollo-server-express';
import Bull, { Queue } from 'bull';
import { CreateFlowInput, FlowStatus, FlowType, UpdateFlowInput } from 'src/graphql';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { ID } from 'src/shared/types/db';
import { v4 } from 'uuid';
import {
	FLOW_CAMPAIGN_INTERACTIONS_QUEUE,
	FLOW_HANDLE_CAMPAIGN_JOB,
	FlowCampaignInteractionsQueueData,
	FlowHandleCampaignJobData,
} from '../queues/flow-interaction.queue';
import { FlowQueueDataObject } from '../types';

@Injectable()
export class FlowsService {
	// This is in a get method to be able to mock it in tests
	getCampaignHandlerRepeatCron() {
		return {
			cron: CronExpression.EVERY_5_MINUTES,
			inMinutes: 5 as const,
		};
	}

	constructor(
		private readonly prisma: PrismaService,
		@Inject(forwardRef(() => getQueueToken(FLOW_CAMPAIGN_INTERACTIONS_QUEUE)))
		private readonly flowCampaignInteractionsQueue: Queue<FlowCampaignInteractionsQueueData>,
	) {}

	stopAllAccountFlows(accountId: ID) {
		return this.prisma.flow.updateMany({
			where: {
				account: Number(accountId),
				date_deleted: null,
			},
			data: {
				status: FlowStatus.stopped,
			},
		});
	}

	async addCampaignHandler(flow: flow, jobOptions?: { maxOfRepeats?: number }) {
		const queueData = this.getQueueData(flow);

		if (queueData.handleCampaignJob) {
			// If the job is already scheduled, remove it
			// and schedule it again
			try {
				await this.removeCampaignHandler(flow);
			} catch {
				/** */
			}
		}

		const options = {
			jobId: FLOW_HANDLE_CAMPAIGN_JOB + '-' + flow.id,
			repeat: {
				cron: this.getCampaignHandlerRepeatCron().cron,
				limit: jobOptions?.maxOfRepeats,
			},
		} satisfies Bull.JobOptions;

		const job = await this.flowCampaignInteractionsQueue.add(
			FLOW_HANDLE_CAMPAIGN_JOB,
			<FlowHandleCampaignJobData>{
				flowId: flow.id,
			},
			options,
		);

		return this.prisma.flow.update({
			where: { id: flow.id },
			data: {
				queue_data: this.generateFlowQueueDataObject(flow, {
					handleCampaignJob: {
						added_at: new Date().toISOString(),
						repeat: {
							key: job.opts.repeat!.key!,
						},
					},
				}),
			},
		});
	}

	async removeCampaignHandler(flow: flow) {
		const queueData = this.getQueueData(flow);

		if (!queueData.handleCampaignJob) return;

		try {
			// Remove the repeatable job
			await this.flowCampaignInteractionsQueue.removeRepeatableByKey(
				queueData.handleCampaignJob.repeat.key,
			);
		} catch {
			// If the job is not found, just remove the queue data
		}

		return this.prisma.flow.update({
			where: { id: flow.id },
			data: {
				queue_data: this.generateFlowQueueDataObject(flow, {
					handleCampaignJob: undefined,
				}),
			},
		});
	}

	generateFlowQueueDataObject(flow: flow, input: Partial<FlowQueueDataObject>) {
		return {
			...((flow.queue_data as object) || {}),
			...input,
		};
	}

	getQueueData(flow: flow) {
		return (flow.queue_data as FlowQueueDataObject) || {};
	}

	async create(input: CreateFlowInput) {
		const { account, ...data } = input;

		if (data.type === FlowType.outbound && !data.segment) {
			throw new ValidationError('When type is outbound, segment is mandatory');
		}

		const item = await this.prisma.flow.create({
			data: {
				id: v4(),
				account: Number(account),
				...data,
			},
		});

		if (data.type === FlowType.outbound && data.status === FlowStatus.active) {
			await this.addCampaignHandler(item);
		}

		return item;
	}

	async update(input: UpdateFlowInput, beforeUpdate: flow) {
		const { id, ...data } = input;

		if (
			data.name === null ||
			data.agent === null ||
			data.daily_budget === null ||
			data.status === null
		)
			throw new ValidationError(
				'Name, agent, segment, daily budget and status are mandatory fields',
			);

		if (beforeUpdate.type === FlowType.outbound && data.segment === null) {
			throw new ValidationError('When type is outbound, segment is mandatory');
		}

		if (data.status === FlowStatus.stopped) {
			// Only the system can stop a flow
			data.status = FlowStatus.paused;
		}

		const item = await this.prisma.flow.update({
			where: { id: String(id) },
			data: {
				...data,
				name: data.name,
				agent: data.agent,
				segment: data.segment,
				daily_budget: data.daily_budget,
				status: data.status,
			},
		});

		if (item.type === FlowType.outbound) {
			const queueData = this.getQueueData(item);

			if (item.status === FlowStatus.active && !queueData.handleCampaignJob) {
				await this.addCampaignHandler(item);
			}
			if (
				[FlowStatus.paused, FlowStatus.stopped].includes(item.status as FlowStatus) &&
				queueData.handleCampaignJob
			) {
				await this.removeCampaignHandler(item);
			}
		}

		return item;
	}

	async softDelete(id: ID) {
		const item = await this.prisma.flow.update({
			where: { id: String(id) },
			data: {
				date_deleted: new Date(),
			},
		});

		await this.removeCampaignHandler(item);

		return item;
	}

	find(id: ID) {
		return this.prisma.flow.findUnique({ where: { id: String(id), date_deleted: null } });
	}

	listForAccount(accountId: ID) {
		return this.prisma.flow.findMany({
			where: {
				account: Number(accountId),
				date_deleted: null,
			},
		});
	}

	listActiveForAccount(accountId: ID) {
		return this.prisma.flow.findMany({
			where: {
				account: Number(accountId),
				date_deleted: null,
				status: FlowStatus.active,
			},
		});
	}
}
