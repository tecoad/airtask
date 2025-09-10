import { Injectable } from '@nestjs/common';
import { Prisma, flow, flow_contact, flow_interaction } from '@prisma/client';
import { differenceInMinutes } from 'date-fns';
import { getLocalInfo } from 'phone-number-to-timezone';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { todayAtMidnight } from 'src/modules/metrics/helpers/date';
import { FlowInteractionStatus } from 'src/shared/types/db';
import { GetLocalInfoReturn } from '../types';

@Injectable()
export class FlowInteractionRulesService {
	constructor(private readonly prisma: PrismaService) {}

	isPhoneInTimeRange(phone: string): boolean {
		const data: GetLocalInfoReturn = getLocalInfo(phone);

		if (!data.time) return false;

		const minRange = 8,
			maxRange = 20;

		return Number(data.time.hour) >= minRange && Number(data.time.hour) <= maxRange;
	}

	contactHasNotBeenCalledInTheLastHour(interactions: flow_interaction[]): boolean {
		if (!interactions || !interactions.length) return true;

		const sorted = interactions.slice().sort((a, b) => {
			// The one with the most recent date_created should come first on the list
			return a.date_created!.getTime() - b.date_created!.getTime();
		});

		const last = sorted[sorted.length - 1];

		// The last interaction should have been ocurred at least 1 hour ago
		return differenceInMinutes(new Date(), last.date_created!) >= 60;
	}

	sumOfAllInteractionsForFlow(flow: flow) {
		return this.prisma.flow_interaction.count({
			where: {
				flow: flow.id,
			},
		});
	}

	sumOfFinishedInteractionsForFlow(flow: flow) {
		return this.prisma.flow_interaction_recording.count({
			where: {
				flow_interaction: {
					flow: flow.id,
				},
			},
		});
	}

	sumOfOngoingInteractionsFowFlow(flow: flow) {
		return this.prisma.flow_interaction.count({
			where: {
				flow: flow.id,
				status: {
					in: [
						FlowInteractionStatus.Requested,
						FlowInteractionStatus.Ringing,
						FlowInteractionStatus.InProgress,
					],
				},
			},
		});
	}

	sumOfAnsweredInteractionsForFlow(flow: flow) {
		return this.prisma.flow_interaction.count({
			where: {
				flow: flow.id,
				status: {
					in: [FlowInteractionStatus.InProgress, FlowInteractionStatus.Finished],
				},
			},
		});
	}

	async contactHasNotFinishedAInteractionYet(flow: flow, contact: flow_contact) {
		const finishedInteractions = await this.prisma.flow_interaction.count({
			where: {
				flow: flow.id,
				contact: contact.id,
				status: FlowInteractionStatus.Finished,
			},
		});

		return finishedInteractions === 0;
	}

	async sumCostOfInteractionsForFlowToday(flow: flow) {
		const interactions = await this.prisma.flow_interaction.findMany({
			where: {
				flow: flow.id,
				cost: {
					not: null,
				},
				// Only created today
				date_created: {
					gte: todayAtMidnight(),
				},
			},
		});

		const totalCost = interactions.reduce((acc, item) => {
			return acc.add(item.cost!);
		}, new Prisma.Decimal(0));

		return {
			totalCostToday: totalCost,
			quantityOfInteractionsWithCostToday: interactions.length,
		};
	}

	async sumCostOfInteractionsForFlow(flow: flow) {
		const interactions = await this.prisma.flow_interaction.findMany({
			where: {
				flow: flow.id,
				cost: {
					not: null,
				},
			},
		});

		const totalCost = interactions.reduce((acc, item) => {
			return acc.add(item.cost!);
		}, new Prisma.Decimal(0));

		return {
			totalCost,
			totalInteractionsForFlowWithCost: interactions.length,
		};
	}

	async flowReachedDailyBudget(flow: flow): Promise<boolean> {
		const { totalCostToday } = await this.sumCostOfInteractionsForFlowToday(flow);

		return totalCostToday.greaterThanOrEqualTo(flow.daily_budget);
	}
}
