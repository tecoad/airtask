import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { AffiliatesModule } from '../affiliates/affiliates.module';
import { CommonModule } from '../common/common.module';
import { FlowsModule } from '../flows/flows.module';
import { StripeCallbackController } from './controllers/stripe-callbacks.controller';
import { USAGE_CONTROL_QUEUE } from './jobs/constants';
import { STRIPE_QUEUE, StripeQueue } from './jobs/stripe.queue';
import { UsageControlQueue } from './jobs/usage-control.queue';
import { CreditsManagerService } from './services/credits-manager.service';
import { SubscriptionManagerService } from './services/subscription-manager.service';
import { SubscriptionPlanService } from './services/subscription-plan.service';
import { UsageManagerService } from './services/usage-manager.service';

@Module({
	imports: [
		forwardRef(() => CommonModule),
		BullModule.registerQueue(
			{
				name: USAGE_CONTROL_QUEUE,
			},
			{
				name: STRIPE_QUEUE,
			},
		),
		forwardRef(() => AccountsModule),
		forwardRef(() => AffiliatesModule),
		forwardRef(() => FlowsModule),
	],
	controllers: [StripeCallbackController],
	providers: [
		SubscriptionPlanService,
		SubscriptionManagerService,
		UsageManagerService,
		UsageControlQueue,
		StripeQueue,
		CreditsManagerService,
	],
	exports: [
		SubscriptionManagerService,
		UsageManagerService,
		SubscriptionPlanService,
		CreditsManagerService,
	],
})
export class SubscriptionsModule {}
