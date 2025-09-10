import { BullModule } from '@nestjs/bull';
import { Module, forwardRef } from '@nestjs/common';
import { AssetsModule } from '../assets/assets.module';
import { CommonModule } from '../common/common.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { FlowCallWebhooksController } from './controllers/twilio-callbacks.controller';
import { FLOW_CONTACTS_QUEUE, FlowContactsQueue } from './queues/flow-contacts.queue';
import {
	FLOW_CAMPAIGN_INTERACTIONS_QUEUE,
	FlowCampaignInteractionsQueue,
} from './queues/flow-interaction.queue';
import {
	FLOW_INTERACTION_RECORD_QUEUE,
	InteractionRecordingQueue,
} from './queues/interaction-recording.queue';
import { FlowCalendarIntegrationService } from './services/flow-calendar-integration.service';
import { FlowInteractionRulesService } from './services/flow-interaction-rules.service';
import { FlowInteractionService } from './services/flow-interaction.service';
import { FlowRecordingsService } from './services/flow-recordings.service';
import { FlowsAgentsService } from './services/flows-agents.service';
import { FlowsContactsSegmentsService } from './services/flows-contacts-segments.service';
import { FlowsContactsService } from './services/flows-contacts.service';
import { FlowsService } from './services/flows.service';

const providersAndExports = [
	FlowsService,
	FlowsAgentsService,
	FlowsContactsSegmentsService,
	FlowsContactsService,
	FlowInteractionService,
	FlowRecordingsService,
	FlowCalendarIntegrationService,
];

@Module({
	imports: [
		forwardRef(() => CommonModule),
		AssetsModule,
		BullModule.registerQueue(
			{
				name: FLOW_CONTACTS_QUEUE,
			},
			{
				name: FLOW_INTERACTION_RECORD_QUEUE,
			},
			{
				name: FLOW_CAMPAIGN_INTERACTIONS_QUEUE,
			},
		),
		forwardRef(() => SubscriptionsModule),
	],
	controllers: [FlowCallWebhooksController],
	providers: [
		...providersAndExports,
		FlowContactsQueue,
		InteractionRecordingQueue,
		FlowCampaignInteractionsQueue,
		FlowInteractionRulesService,
	],
	exports: [...providersAndExports],
})
export class FlowsModule {}
