import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { account } from '@prisma/client';
import { OnBoardingStepName, UpdateAccountSettingsInput } from 'src/graphql';
import { dbSegmentToGqlSegment } from 'src/modules/accounts/utils/normalize';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { SubscriptionManagerService } from 'src/modules/subscriptions/services/subscription-manager.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';
import { UserNotAAccountMemberError } from 'src/shared/errors/user-not-a-account-member.error';
import { ID } from 'src/shared/types/db';
import { AccountPermissionsManagerService } from '../../../../accounts/services/account-permissions-manager.service';
import { AccountsService } from '../../../../accounts/services/accounts.service';
import { OnBoardingStepsService } from '../../../../accounts/services/onboard-steps.service';

@Resolver('Account')
export class AccountsResolver {
	constructor(
		private readonly accountsService: AccountsService,
		private readonly accountPermissionsManager: AccountPermissionsManagerService,
		private readonly subscriptionManager: SubscriptionManagerService,
		private readonly onboardingSteps: OnBoardingStepsService,
		private readonly prisma: PrismaService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	async account(@CurrentUser() user: UserJwtPayload, @Args('id') accountId: ID) {
		const isAllowed = await this.accountPermissionsManager.isUserMemberOfAccount(
			user.id,
			Number(accountId),
		);

		if (!isAllowed) {
			throw new UserNotAAccountMemberError();
		}

		return this.accountsService.find(accountId);
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async updateAccountSettings(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: UpdateAccountSettingsInput,
	) {
		const { id } = input;

		const isAllowed = await this.accountPermissionsManager.isUserMemberOfAccount(
			user.id,
			Number(id),
		);

		if (!isAllowed) {
			throw new UserNotAAccountMemberError();
		}

		this.onboardingSteps.queueEnsureStepForAccount(
			Number(id),
			OnBoardingStepName.finish_setup_account,
		);

		return this.accountsService.updateSettings(input);
	}

	@Query()
	availableSegments() {
		return this.accountsService.availableSegments();
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async registerOnboardingStepForAccount(
		@CurrentUser() user: UserJwtPayload,
		@Args('accountId') accountId: ID,
		@Args('step') step: OnBoardingStepName,
	) {
		const isAllowed = await this.accountPermissionsManager.isUserMemberOfAccount(
			user.id,
			Number(accountId),
		);

		if (!isAllowed) {
			throw new UserNotAAccountMemberError();
		}

		return this.onboardingSteps.ensureStepForAccount(Number(accountId), step);
	}

	@ResolveField('users')
	async accountUsers(@Parent() account: account) {
		return this.accountsService.findUsers(account.id);
	}

	@ResolveField('active_subscription')
	async active_subscription(@Parent() account: account) {
		const { subscription } = await this.accountsService.findSubscriptionPlan(account);

		return (await this.subscriptionManager.isSubscriptionActive(subscription!))
			? subscription
			: null;
	}

	@ResolveField('segment')
	async segment(@Parent() account: account) {
		if (account.segment) {
			const result = await this.prisma.segment.findUnique({
				where: { id: account.segment },
			});

			if (result) {
				return dbSegmentToGqlSegment(result);
			}
		}
	}

	@ResolveField('concluded_onboarding_steps')
	async concluded_onboarding_steps(
		@CurrentUser() user: UserJwtPayload,
		@Parent() account: account,
	) {
		const isAllowed = await this.accountPermissionsManager.isUserMemberOfAccount(
			user.id,
			account.id,
		);

		if (!isAllowed) {
			return [];
		}

		return this.onboardingSteps.accountConcludedSteps(account.id);
	}
}
