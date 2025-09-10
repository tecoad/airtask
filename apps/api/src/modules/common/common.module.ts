import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module, forwardRef } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DiscordModule } from '../discord/discord.module';
import { HealthController } from './controllers/health.controller';
import { EMAIL_QUEUE, EmailQueue } from './jobs/email.queue';
import { DirectusSdk } from './services/directus-sdk.service';
import { EmailService } from './services/email.service';
import { HasherSerice } from './services/hasher.service';
import { PrismaService } from './services/prisma.service';
import { StripeService } from './services/stripe.service';
import { SystemNotificationsService } from './services/system-notifications.service';
import { TrackingService } from './services/tracking.service';
import { TwilioService } from './services/twilio.service';

const providersAndExports = [
	PrismaService,
	StripeService,
	HasherSerice,
	EmailService,
	DirectusSdk,
	SystemNotificationsService,
	TrackingService,
	TwilioService,
];

@Module({
	imports: [
		TerminusModule,
		HttpModule.register({}),
		forwardRef(() => DiscordModule),
		BullModule.registerQueue({
			name: EMAIL_QUEUE,
		}),
	],
	controllers: [HealthController],
	providers: [...providersAndExports, EmailQueue],
	exports: [...providersAndExports],
})
export class CommonModule {}
