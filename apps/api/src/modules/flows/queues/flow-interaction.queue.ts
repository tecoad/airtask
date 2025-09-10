import { Process, Processor } from '@nestjs/bull';

import { Inject, forwardRef } from '@nestjs/common';
import { Job } from 'bull';
import { AccountUsageKind, FlowContactStatus, FlowStatus, FlowType } from 'src/graphql';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { CreditsManagerService } from 'src/modules/subscriptions/services/credits-manager.service';
import { UsageManagerService } from 'src/modules/subscriptions/services/usage-manager.service';
import { asyncFilter } from 'src/shared/utils/async-filter';
import { FlowInteractionRulesService } from '../services/flow-interaction-rules.service';
import { FlowInteractionService } from '../services/flow-interaction.service';
import { FlowsService } from '../services/flows.service';
import { concurrencyCallsMath } from '../utils/concurrency-calls-math';
import { remainingDayFraction } from '../utils/time';

export const FLOW_CAMPAIGN_INTERACTIONS_QUEUE = 'flow-campaign-interactions-queue';
export const FLOW_HANDLE_CAMPAIGN_JOB = 'flow-basic-handle-campaign-job';
export const FLOW_CREATE_INTERACTION_JOB = 'flow-create-interaction-job';
export const FLOW_CALCULATE_CONCURRENCY_CALLS_JOB =
	'flow-calculate-concurrency-calls-job';

export type FlowCampaignInteractionsQueueData =
	| FlowHandleCampaignJobData
	| FlowCreateInteractionJobData
	| FlowCalculateConcurrencyCallsJob;
export type FlowHandleCampaignJobData = {
	flowId: string;
};
export type FlowCreateInteractionJobData = {
	flowId: string;
	contactId: string;
};
export type FlowCalculateConcurrencyCallsJob = {
	flowId: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const onFlowHandleCampaignJobRepeat = (job: Job) => ({});
// eslint-disable-next-line prefer-const
let _replaceCreateInteractionJob: any = undefined;
export const replaceCreateInteractionJob = (
	callback: (job: Job<FlowCreateInteractionJobData>) => any,
) => {
	_replaceCreateInteractionJob = callback;
};

@Processor(FLOW_CAMPAIGN_INTERACTIONS_QUEUE)
export class FlowCampaignInteractionsQueue {
	constructor(
		private readonly prisma: PrismaService,
		private readonly flowInteractionService: FlowInteractionService,
		@Inject(forwardRef(() => UsageManagerService))
		private readonly usageManagerService: UsageManagerService,
		private readonly interactionRulesService: FlowInteractionRulesService,
		@Inject(forwardRef(() => FlowsService))
		private readonly flowsService: FlowsService,
		private readonly creditsManager: CreditsManagerService,
	) {}

	/**
	 * Has the responsibility to handle the campaign
	 * that is group all the contacts we need to call
	 * and check by the concurrency_calls. The selected contacts
	 * will be sent to the next job
	 */
	@Process(FLOW_HANDLE_CAMPAIGN_JOB)
	async handleCampaignJob(job: Job<FlowHandleCampaignJobData>) {
		// This is here to be able to mock it in tests, only
		// i wasn't able to mock the method at all because it loses
		// the process metadata, so this is the only way i found
		onFlowHandleCampaignJobRepeat(job);

		const { flowId } = job.data;

		const flow = await this.prisma.flow.findUnique({
			where: {
				id: flowId,
			},
		});

		// This rules cancel the campaign handler
		// until it is added again for some reason.
		if (!flow || flow.status !== FlowStatus.active || flow.type !== FlowType.outbound) {
			// Remove repeatable job
			await job.queue.removeRepeatableByKey(job.opts.repeat!.key!);
			// If the flow exists, remove the data in queue_data
			if (flow) {
				await this.flowsService.removeCampaignHandler(flow);
			}
			return {
				stopReason: 'flow_is_not_active' as const,
				hasRemovedPermanently: true,
			};
		}

		// Rules applied that only break this handle.
		// The next handle on cron will execute the rules again
		// If ANY of the rules below returns true, the handle will be broken
		const rulesToBreakThisHandling = [
			// If the account is NOT allowed to perform this operation
			{
				check: async () => {
					const isAllowedToPerformOperation =
						await this.usageManagerService.isAccountAllowedToPerformOperation(
							flow.account,
							AccountUsageKind.flow,
							1,
						);

					return !isAllowedToPerformOperation;
				},
				name: 'account_is_not_allowed_to_perform_operation' as const,
			},
			{
				check: () => this.interactionRulesService.flowReachedDailyBudget(flow),
				name: 'flow_reached_daily_budget' as const,
			},
		];

		for (const rule of rulesToBreakThisHandling) {
			if (await rule.check()) {
				return {
					stopReason: rule.name,
					hasRemovedPermanently: false,
				};
			}
		}

		// Get all contacts for this campaign by the segment
		const contactsForCampaign = await this.prisma.flow_contact.findMany({
			where: {
				flow_contact_flow_contact_segment: {
					some: {
						flow_contact_segment_id: flow.segment,
					},
				},
				account: flow.account,
				status: FlowContactStatus.active,
			},
			orderBy: {
				date_created: 'asc',
			},
		});
		// Get all interactions created for this campaign
		const createdInteractionsForCampaign = await this.prisma.flow_interaction.findMany({
			where: {
				flow: flow.id,
			},
		});

		type RuleToCallContact =
			| 'phone_is_not_in_time_range'
			| 'contact_has_been_called_in_the_last_hour'
			| 'contact_has_finished_a_interaction_already';
		const contactsThatNotPassedTheRules: {
			contactId: string;
			ruleName: RuleToCallContact;
		}[] = [];

		// List of contacts that are eligible to be called
		const contactsToCall = await asyncFilter(contactsForCampaign, async (contact) => {
			const interactionsForContact = createdInteractionsForCampaign.filter(
				(interaction) => {
					return interaction.contact === contact.id;
				},
			);

			// All of this rules must have a result TRUE for the contact
			// to be called
			const rulesToCallContact = [
				{
					check: () => this.interactionRulesService.isPhoneInTimeRange(contact.phone),
					name: 'phone_is_not_in_time_range',
				},
				{
					check: () =>
						this.interactionRulesService.contactHasNotBeenCalledInTheLastHour(
							interactionsForContact,
						),
					name: 'contact_has_been_called_in_the_last_hour',
				},
				{
					check: () =>
						this.interactionRulesService.contactHasNotFinishedAInteractionYet(
							flow,
							contact,
						),
					name: 'contact_has_finished_a_interaction_already',
				},
			] satisfies {
				check: () => Promise<boolean> | boolean;
				name: RuleToCallContact;
			}[];

			const results: boolean[] = [];

			for (const rule of rulesToCallContact) {
				const result = await rule.check();

				results.push(result);
				// If any rule returns false, the contact will not be called
				// and we dont need to execute the other rules
				if (!result) {
					contactsThatNotPassedTheRules.push({
						contactId: contact.id,
						ruleName: rule.name,
					});
					console.log(
						`Contact ${contact.id} ${contact.phone} did not passed the rule ${rule.name}`,
					);
				}
				if (!result) break;
			}

			return results.every((v) => v);
		});

		const numberOfInteractionsGoingOn =
			await this.interactionRulesService.sumOfOngoingInteractionsFowFlow(flow);

		await job.progress(50);

		let contactsAddedToQueue = 0;

		if (numberOfInteractionsGoingOn < flow.concurrency_calls) {
			const marginToCall = flow.concurrency_calls - numberOfInteractionsGoingOn;

			for (const i in Array.from({
				length: marginToCall,
			})) {
				const index = Number(i);
				const contact = contactsToCall[index];

				if (!contact) break;

				contactsAddedToQueue++;

				await job.queue.add(FLOW_CREATE_INTERACTION_JOB, <FlowCreateInteractionJobData>{
					contactId: contact.id,
					flowId: flow.id,
				});
			}
		}

		await job.progress(100);

		return {
			contactsAddedToQueue,
			contactsThatNotPassedTheRules,
		};
	}

	@Process(FLOW_CREATE_INTERACTION_JOB)
	async createInteractionJob(job: Job<FlowCreateInteractionJobData>) {
		if (_replaceCreateInteractionJob) {
			return _replaceCreateInteractionJob(job);
		}

		const { contactId, flowId } = job.data;

		const flow = await this.prisma.flow.findUnique({
				where: {
					id: flowId,
				},
			}),
			contact = await this.prisma.flow_contact.findUnique({
				where: {
					id: contactId,
				},
			});

		if (!flow || !contact) return;

		await this.flowInteractionService.createOutboundInteraction({
			agentId: flow.agent,
			interactionData: {
				contact,
				flow,
			},
		});
	}

	@Process(FLOW_CALCULATE_CONCURRENCY_CALLS_JOB)
	async calculateFlowConcurrencyCalls(job: Job<FlowCalculateConcurrencyCallsJob>) {
		const { flowId } = job.data;

		const flow = await this.prisma.flow.findUniqueOrThrow({ where: { id: flowId } });

		const { daily_budget: dailyBudgetForFlow } = flow;

		// Sum of interactions for TODAY
		const { totalCostToday: costOfInteractionsToday } =
			await this.interactionRulesService.sumCostOfInteractionsForFlowToday(flow);

		// Sum of ALL interactions
		const { totalCost: costOfAllInteractions, totalInteractionsForFlowWithCost } =
			await this.interactionRulesService.sumCostOfInteractionsForFlow(flow);

		const { balance: totalBalance } = await this.creditsManager.totalBalanceForAccount(
			flow.account,
		);

		const { length: activeCampaignsForAccount } =
			await this.flowsService.listActiveForAccount(flow.account);

		const percentageOfDayLeft = remainingDayFraction();

		const cronInterval = this.flowsService.getCampaignHandlerRepeatCron().inMinutes;

		const totalOfInteractionsForFlow =
			await this.interactionRulesService.sumOfAllInteractionsForFlow(flow);
		const totalOfAnsweredInteractionsForFlow =
			await this.interactionRulesService.sumOfAnsweredInteractionsForFlow(flow);
		const totalOfOngoingInteractionsForFlow =
			await this.interactionRulesService.sumOfOngoingInteractionsFowFlow(flow);

		const finalMath = concurrencyCallsMath({
			totalBalance,
			dailyBudgetForFlow,

			costOfInteractionsToday,

			activeCampaignsForAccount,

			totalInteractionsForFlow: totalOfInteractionsForFlow,
			totalInteractionsForFlowWithCost: totalInteractionsForFlowWithCost,

			totalOfAnsweredInteractionsForFlow,
			totalOfOngoingInteractionsForFlow,
			costOfAllInteractions,

			percentageOfDayLeft,
			cronInterval,
		});

		await this.prisma.flow.update({
			where: {
				id: flow.id,
			},
			data: {
				concurrency_calls: finalMath,
			},
		});

		return {
			concurrency_calls: finalMath,
		};
	}
}
