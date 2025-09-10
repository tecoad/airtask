import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { AccountsService } from 'src/modules/accounts/services/accounts.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { generateNextResetUsageDate } from '../helpers';
import { CreditsManagerService } from '../services/credits-manager.service';
import { UsageManagerService } from '../services/usage-manager.service';
import { RESET_ACCOUNT_USAGE_JOB, USAGE_CONTROL_QUEUE } from './constants';

export type UsageControlQueueData = ResetAccountJobData;
export type ResetAccountJobData = {
	accountId: number;
};

@Processor(USAGE_CONTROL_QUEUE)
export class UsageControlQueue {
	constructor(
		private readonly prisma: PrismaService,
		private readonly accountsService: AccountsService,
		private readonly creditsManagerService: CreditsManagerService,
		private readonly usageManagerService: UsageManagerService,
	) {}

	@Process(RESET_ACCOUNT_USAGE_JOB)
	async resetAccountUsage(job: Job<ResetAccountJobData>) {
		const { accountId } = job.data;

		const { planPrice } = await this.accountsService.findSubscriptionPlan(accountId);

		if (planPrice) {
			await this.creditsManagerService.updateCreditGivenByPlanOnResetUsage(
				accountId,
				planPrice,
			);
			await this.usageManagerService.setAccountResetUsageDate(
				accountId,
				generateNextResetUsageDate(),
			);
		} else {
			await this.creditsManagerService.removeCreditGivenByPlan(accountId);
		}

		await job.progress(100);

		return {
			success: true,
		};
	}
}
