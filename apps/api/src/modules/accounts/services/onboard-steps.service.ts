import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { onboarding_step, onboarding_step_account } from '@prisma/client';
import { Job, Queue } from 'bull';
import { AccountUsageKind, OnBoardingStep, OnBoardingStepName } from 'src/graphql';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { TrackingService } from 'src/modules/common/services/tracking.service';
import { ENSURE_STEP_FOR_ACCOUNT_JOB, ONBOARDING_STEPS_QUEUE } from '../jobs/constants';
import {
	EnsureStepForAccountJobData,
	OnboardingStepQueueData,
} from '../jobs/onboarding-steps.queue';
import { onBoardingStepNameToModule } from '../utils/onboarding-step-name-to-module';

@Injectable()
export class OnBoardingStepsService implements OnModuleInit {
	constructor(
		private readonly prisma: PrismaService,
		@InjectQueue(ONBOARDING_STEPS_QUEUE)
		private readonly onboardingStepsQueue: Queue<OnboardingStepQueueData>,
		private readonly trackingService: TrackingService,
	) {}

	async onModuleInit() {
		// Ensure all steps are at database
		const dbSteps = await this.prisma.onboarding_step.findMany(),
			steps = Object.values(OnBoardingStepName);

		for (const step of steps) {
			const isCreated = dbSteps.find((item) => item.name === step);

			if (!isCreated) {
				await this.prisma.onboarding_step.create({
					data: {
						name: step,
						module: onBoardingStepNameToModule[step],
					},
				});
			}
		}
	}

	/**
	 * Recommended to not to await this method on calling
	 * it is safe so you can call it without await
	 */
	async queueEnsureStepForAccount(
		accountId: number,
		stepName: OnBoardingStepName,
	): Promise<Job<EnsureStepForAccountJobData> | null> {
		try {
			const account = await this.prisma.account.findUnique({
				where: {
					id: accountId,
				},
				include: {
					onboarding_step_account: {
						include: {
							onboarding_step: true,
						},
					},
				},
			});

			// Don't wanna queue if account already has this step
			// not using job id because we don't wanna to lock it forever
			if (
				account?.onboarding_step_account.find(
					(item) => item.onboarding_step?.name === stepName,
				)
			) {
				return null;
			}

			const job = await this.onboardingStepsQueue.add(ENSURE_STEP_FOR_ACCOUNT_JOB, {
				accountId,
				stepName,
			});

			return job;
		} catch (e) {
			console.log(e);
			/** */
			return null;
		}
	}

	async ensureStepForAccount(accountId: number, stepName: OnBoardingStepName) {
		const step = await this.prisma.onboarding_step.findUnique({
				where: {
					name: stepName,
				},
			}),
			account = await this.prisma.account.findUnique({
				where: {
					id: accountId,
				},
				include: {
					onboarding_step_account: {
						include: {
							onboarding_step: true,
						},
					},
				},
			});

		// This method should be safe
		if (!step || !account) return;

		const accountSteps = account.onboarding_step_account;

		// Account already has this step
		if (
			accountSteps.find((item) => {
				return item.onboarding_step?.name === stepName;
			})
		)
			return;

		// Account doesn't have this step
		const relation = await this.prisma.onboarding_step_account.create({
			data: {
				onboarding_step_id: step.id,
				account_id: account.id,
				date_created: new Date(),
			},
		});

		this.trackingService.stepConcluded({
			accountId: account.id,
			stepName,
		});

		return this.onBoardingStepAccountToOnBoardingStep({
			...relation,
			onboarding_step: step,
		});
	}

	async accountConcludedSteps(accountId: number): Promise<OnBoardingStep[]> {
		const account = await this.prisma.account.findUnique({
			where: {
				id: accountId,
			},
			include: {
				onboarding_step_account: {
					include: {
						onboarding_step: true,
					},
				},
			},
		});

		return (
			account?.onboarding_step_account.flatMap((v) => {
				if (v.onboarding_step) {
					return this.onBoardingStepAccountToOnBoardingStep({
						...v,
						// typescript damn
						onboarding_step: v.onboarding_step,
					});
				}

				return [];
			}) || []
		);
	}

	onBoardingStepAccountToOnBoardingStep(
		data: onboarding_step_account & {
			onboarding_step: onboarding_step;
		},
	): OnBoardingStep {
		return {
			...data.onboarding_step,
			id: data.onboarding_step.id.toString(),
			name: data.onboarding_step.name as OnBoardingStepName,
			module: data.onboarding_step.module as AccountUsageKind,
			date_created: data.date_created.toISOString(),
		};
	}
}
