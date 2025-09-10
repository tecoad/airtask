import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { CommonModule } from '../common/common.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { UsersModule } from '../users/users.module';
import {
	DISCORD_INTERACTIONS_QUEUE,
	DiscordInteractionsQueue,
} from './queues/discord-interaction.queue';
import { AiAssistantToolsService } from './services/ai-assistant-tools.service';
import { DiscordBotService } from './services/discord-bot.service';
import { DiscordMainEventsHandler } from './services/main-events-handler.service';

@Module({
	imports: [
		forwardRef(() => CommonModule),
		BullModule.registerQueue({
			name: DISCORD_INTERACTIONS_QUEUE,
		}),
		forwardRef(() => SubscriptionsModule),
		forwardRef(() => AccountsModule),
		UsersModule,
	],
	providers: [
		DiscordMainEventsHandler,
		DiscordInteractionsQueue,
		DiscordBotService,
		AiAssistantToolsService,
	],
	exports: [DiscordBotService],
})
export class DiscordModule {}
