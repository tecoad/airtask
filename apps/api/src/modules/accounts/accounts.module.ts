import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { AccountApiAuthGuard } from './guards/account-rest-api-auth.guard';
import { ONBOARDING_STEPS_QUEUE } from './jobs/constants';
import { OnboardingStepsQueue } from './jobs/onboarding-steps.queue';
import { AccountApiKeyService } from './services/account-api-key.service';
import { AccountPermissionsManagerService } from './services/account-permissions-manager.service';
import { AccountsService } from './services/accounts.service';
import { OnBoardingStepsService } from './services/onboard-steps.service';

@Module({
	imports: [
		forwardRef(() => CommonModule),
		forwardRef(() => SubscriptionsModule),
		BullModule.registerQueue({
			name: ONBOARDING_STEPS_QUEUE,
		}),
	],
	exports: [
		AccountsService,
		AccountApiKeyService,
		AccountPermissionsManagerService,
		OnBoardingStepsService,
		AccountApiAuthGuard,
	],
	providers: [
		AccountsService,
		AccountApiKeyService,
		AccountPermissionsManagerService,
		OnBoardingStepsService,
		OnboardingStepsQueue,
		AccountApiAuthGuard,
	],
})
export class AccountsModule {}
