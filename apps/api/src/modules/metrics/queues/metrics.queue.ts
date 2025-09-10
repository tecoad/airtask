import { Process, Processor } from '@nestjs/bull';
import { account } from '@prisma/client';
import { Job } from 'bull';
import {
	SystemNotificationsService
} from 'src/modules/common/services/system-notifications.service';
import { MetricsService } from '../services/metrics.service';
import { DAILY_METRICS_JOB, METRICS_QUEUE } from './constants';

export type HandleDailyMetricsJobData = {
	from: string;
	to: string;
};

export type MetricsQueueData = HandleDailyMetricsJobData;

@Processor(METRICS_QUEUE)
export class MetricsQueue {
	constructor(
		private readonly metricsService: MetricsService,
		private readonly systemNotificationsService: SystemNotificationsService,
	) {}

	@Process(DAILY_METRICS_JOB)
	async handleDailyMetricsJob(job: Job<HandleDailyMetricsJobData>) {
		const { from: _from, to: _to } = job.data,
			from = new Date(_from),
			to = new Date(_to);

		const quotationRequests = await this.metricsService.quotationRequestByPeriod(
				from,
				to,
			),
			quotationConversations = await this.metricsService.quotationConversationByPeriod(
				from,
				to,
			);

		const accountsInvolvedInRequests: account['id'][] = [];

		for (const item of quotationRequests) {
			if (item.account && !accountsInvolvedInRequests.includes(item.account)) {
				accountsInvolvedInRequests.push(item.account);
			}
		}

		const { length: accountsInvolvedSum } = accountsInvolvedInRequests;

		this.systemNotificationsService.dailyQuotationRequestsMetric({
			date: from,
			accountsInvolvedInRequests: accountsInvolvedSum,
			quantityOfConversationsInitiated: quotationConversations.length,
			quantityOfQuotationRequests: quotationRequests.length,
		});

		job.progress(100);

		return {
			accountsInvolved: accountsInvolvedSum,
			quantityOfConversationsInitiated: quotationConversations.length,
			quantityOfQuotationRequests: quotationRequests.length,
		};
	}
}
