import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
	CreateExtraCreditCheckoutInput,
	CreateSubscriptionCheckoutInput,
	CreateSubscriptionCheckoutResult,
	SubscriptionPortalInput,
	SubscriptionPortalResult,
} from 'src/graphql';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { AccountsService } from 'src/modules/accounts/services/accounts.service';
import { UsageManagerService } from 'src/modules/subscriptions/services/usage-manager.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';
import { ID } from 'src/shared/types/db';
import { SubscriptionManagerService } from '../../../../subscriptions/services/subscription-manager.service';

@Resolver()
export class SubscriptionsResolver {
	constructor(
		private readonly subscriptionManagerService: SubscriptionManagerService,
		private readonly accountsService: AccountsService,
		private readonly accountPermissionsManager: AccountPermissionsManagerService,
		private readonly usageManager: UsageManagerService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	createSubscriptionCheckout(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: CreateSubscriptionCheckoutInput,
	): Promise<CreateSubscriptionCheckoutResult> {
		return this.subscriptionManagerService.createSubscription(user.id, input);
	}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	subscriptionPortal(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: SubscriptionPortalInput,
	): Promise<SubscriptionPortalResult> {
		return this.subscriptionManagerService.createCustomerBillingPortal(
			user.id,
			Number(input.accountId),
		);
	}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	async accountSubscriptionData(
		@CurrentUser() user: UserJwtPayload,
		@Args('accountId') accountId: ID,
	) {
		await this.accountPermissionsManager.throwIfUserNotAMemberOfAccount(
			user.id,
			Number(accountId),
		);

		return this.accountsService.accountSubscriptionData(accountId);
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async createExtraCreditCheckout(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: CreateExtraCreditCheckoutInput,
	) {
		await this.accountPermissionsManager.isUserManagerOfAccount(
			user.id,
			Number(input.accountId),
		);

		return this.usageManager.createExtraCreditCheckout(user.id, input);
	}
}
