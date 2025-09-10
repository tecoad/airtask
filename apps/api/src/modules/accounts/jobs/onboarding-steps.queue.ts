import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { OnBoardingStepName } from 'src/graphql';
import { OnBoardingStepsService } from '../services/onboard-steps.service';
import { ENSURE_STEP_FOR_ACCOUNT_JOB, ONBOARDING_STEPS_QUEUE } from './constants';

export type OnboardingStepQueueData = EnsureStepForAccountJobData;

export type EnsureStepForAccountJobData = {
	accountId: number;
	stepName: OnBoardingStepName;
};

@Processor(ONBOARDING_STEPS_QUEUE)
export class OnboardingStepsQueue {
	constructor(private readonly onBoardStepsService: OnBoardingStepsService) {}

	@Process(ENSURE_STEP_FOR_ACCOUNT_JOB)
	async ensureStepForAccountJob(job: Job<EnsureStepForAccountJobData>) {
		const { accountId, stepName } = job.data;

		await this.onBoardStepsService.ensureStepForAccount(accountId, stepName);

		job.progress(100);
	}
}
