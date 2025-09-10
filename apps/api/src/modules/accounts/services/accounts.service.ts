import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Prisma, account } from '@prisma/client';
import {
	AccountSubscriptionData,
	PlanInterval,
	Segment,
	UpdateAccountSettingsInput,
} from 'src/graphql';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { getPrevResetUsageDate } from 'src/modules/subscriptions/helpers';
import { CreditsManagerService } from 'src/modules/subscriptions/services/credits-manager.service';
import { ID } from 'src/shared/types/db';
import { dbSegmentToGqlSegment } from '../utils/normalize';

@Injectable()
export class AccountsService {
	constructor(
		private readonly prisma: PrismaService,
		@Inject(forwardRef(() => CreditsManagerService))
		private readonly creditsManager: CreditsManagerService,
	) {}

	async find(id: ID) {
		return this.prisma.account.findUnique({
			where: {
				id: Number(id),
			},
		});
	}

	async findUsers(id: ID) {
		const account = await this.prisma.account.findUnique({
			where: {
				id: Number(id),
			},
			include: {
				account_user: {
					include: {
						user: true,
					},
				},
			},
		});

		return account?.account_user;
	}

	async findSubscriptionPlan(_account: ID | account) {
		const account = await this.mayBeAccount(_account);

		const subscription = await this.prisma.subscription.findFirst({
			where: {
				account: account?.id,
			},
			include: {
				subscription_plan_subscription_subscription_planTosubscription_plan: true,
				subscription_plan_price: true,
			},
		});

		return {
			subscription,
			plan:
				subscription?.subscription_plan_subscription_subscription_planTosubscription_plan ||
				null,
			planPrice: subscription?.subscription_plan_price || null,
		};
	}

	mayBeAccount(account: ID | account) {
		return typeof account === 'object' ? account : this.find(account);
	}

	async accountSubscriptionData(_account: ID): Promise<AccountSubscriptionData> {
		const account = await this.mayBeAccount(_account);

		const { plan, subscription } = await this.findSubscriptionPlan(account!);
		const { balance } = await this.creditsManager.totalBalanceForAccount(account!.id);
		// const extraCredits = await this.usageManager.getAccountExtraCredits(account!.id!);
		// const usages = await this.usageManager.getAccountUsages(account!.id);

		return {
			plan: plan!.name!,
			plan_interval: subscription!.recurring_interval as PlanInterval,
			credits: balance.toNumber(),
			// extra_credits: extraCredits.length,
			// usages,
			period_start: getPrevResetUsageDate(account!.date_reset_usage!),
			period_end: account?.date_reset_usage,
		};
	}

	updateSettings(input: UpdateAccountSettingsInput) {
		const { id, segment, ...rest } = input;

		return this.update(id, {
			...rest,
			segment_account_segmentTosegment: {
				connect: {
					id: Number(segment),
				},
			},
		});
	}

	update(id: ID, input: Prisma.accountUpdateInput) {
		return this.prisma.account.update({
			where: {
				id: Number(id),
			},
			data: input,
		});
	}

	async availableSegments(): Promise<Segment[]> {
		const segments = await this.prisma.segment.findMany();

		return segments.map(dbSegmentToGqlSegment);
	}
}
