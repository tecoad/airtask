import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';
import { midnightMetricsJobPeriod } from '../helpers/date';
import { dailyMetricUniqueId } from '../helpers/job';
import { DAILY_METRICS_JOB, METRICS_QUEUE } from '../queues/constants';
import { MetricsQueueData } from '../queues/metrics.queue';

@Injectable()
export class ScheduledMetricsService {
	logger = new Logger(ScheduledMetricsService.name);

	constructor(
		@InjectQueue(METRICS_QUEUE)
		private readonly metricsQueue: Queue<MetricsQueueData>,
	) {}

	@Cron(
		//https://crontab.guru
		'59 23 * * *',
		{
			timeZone: 'America/Sao_Paulo',
		},
	)
	dailyMetrics() {
		this.logger.verbose(
			`Daily metrics cron started at ${new Date().toLocaleString('pt-BR')}`,
		);

		this.dailyQuotationRequests();
	}

	dailyQuotationRequests() {
		const { from, to } = midnightMetricsJobPeriod();

		this.metricsQueue.add(
			DAILY_METRICS_JOB,
			{
				from: from.toISOString(),
				to: to.toISOString(),
			},
			{
				jobId: dailyMetricUniqueId(DAILY_METRICS_JOB),
			},
		);
	}
}
