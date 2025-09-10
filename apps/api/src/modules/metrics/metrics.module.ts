import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { METRICS_QUEUE } from './queues/constants';
import { MetricsQueue } from './queues/metrics.queue';
import { MetricsService } from './services/metrics.service';
import { ScheduledMetricsService } from './services/scheduled-metrics.service';

@Module({
	imports: [
		CommonModule,
		BullModule.registerQueue({
			name: METRICS_QUEUE,
		}),
	],
	providers: [MetricsService, MetricsQueue, ScheduledMetricsService],
})
export class MetricsModule {}
