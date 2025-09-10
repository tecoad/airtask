import { Injectable } from '@nestjs/common';
import { account } from '@prisma/client';
import { AccountUsageKind } from 'src/graphql';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { SubscriptionManagerService } from 'src/modules/subscriptions/services/subscription-manager.service';
import {
	AccountNotAllowedToModuleError,
	UserNotAAccountMemberError,
	UserNotAccountManagerError,
} from 'src/shared/errors';
import { AccountWithoutActiveSubscriptionError } from 'src/shared/errors/account-without-active-subscription.error';
import { AccountRole, ID } from 'src/shared/types/db';
import { AccountsService } from './accounts.service';

@Injectable()
export class AccountPermissionsManagerService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly accountsService: AccountsService,
		private readonly subscriptionsManager: SubscriptionManagerService,
	) {}

	/**
	 * User is allowed to read a module in an account.
	 * User should be a owner of the account and the account should be allowed to use the module
	 * Account should be allowed to use module and has active subscription
	 */
	async throwIfUserIsNotAllowedToReadModuleInAccount(
		userId: number,
		accountId: number,
		module?: AccountUsageKind,
	) {
		const account = await this.prisma.account.findUniqueOrThrow({
			where: { id: accountId },
			include: { account_user: true },
		});

		await this.throwIfAccountIsNotAllowedToUseModule(account, module);

		const isAccountMember = account.account_user.some(
			(account_user) => account_user.user_id === userId,
		);

		if (!isAccountMember) {
			throw new UserNotAAccountMemberError();
		}
	}

	/**
	 * User is allowed to create, update or delete a module in an account.
	 * User should be a owner of the account and the account should be allowed to use the module
	 * Account should be allowed to use module and has active subscription
	 */
	async throwIfUserIsNotAllowedToManageModuleInAccount(
		userId: number,
		accountId: number,
		module?: AccountUsageKind,
	) {
		const account = await this.prisma.account.findUniqueOrThrow({
			where: { id: accountId },
			include: { account_user: true },
		});

		await this.throwIfAccountIsNotAllowedToUseModule(account, module);

		const isAccountMember = account.account_user.some(
			(account_user) => account_user.user_id === userId,
		);

		if (!isAccountMember) {
			throw new UserNotAAccountMemberError();
		}

		const isAccountManager = account.account_user.some(
			(account_user) =>
				account_user.user_id === userId && account_user.role === AccountRole.Owner,
		);

		if (!isAccountManager) {
			throw new UserNotAccountManagerError();
		}
	}
	/**
	 * Account's plan includes the module
	 * Account has active subscription
	 */
	async throwIfAccountIsNotAllowedToUseModule(
		account: account | ID,
		module?: AccountUsageKind,
	) {
		const { plan, subscription } =
			await this.accountsService.findSubscriptionPlan(account);

		if (
			!subscription ||
			!(await this.subscriptionsManager.isSubscriptionActive(subscription))
		) {
			throw new AccountWithoutActiveSubscriptionError();
		}

		if (module && !((plan?.allowed_modules as AccountUsageKind) || []).includes(module)) {
			throw new AccountNotAllowedToModuleError();
		}
	}
	/**
	 * Only if user is a member of account
	 */
	async isUserMemberOfAccount(userId: number, accountId: number) {
		const account = await this.prisma.account.findUniqueOrThrow({
			where: { id: accountId },
			include: { account_user: true },
		});

		return account.account_user.some((account_user) => account_user.user_id === userId);
	}
	/**
	 * Only if user is a member of account
	 */
	async throwIfUserNotAMemberOfAccount(
		...params: Parameters<typeof this.isUserMemberOfAccount>
	) {
		const check = await this.isUserMemberOfAccount(...params);

		if (!check) {
			throw new UserNotAAccountMemberError();
		}
	}
	/**
	 * Only if user is a manager of account
	 */
	async isUserManagerOfAccount(userId: number, accountId: number) {
		const account = await this.prisma.account.findUniqueOrThrow({
			where: { id: accountId },
			include: { account_user: true },
		});

		return account.account_user.some(
			(account_user) =>
				account_user.user_id === userId && account_user.role === AccountRole.Owner,
		);
	}
	/**
	 * Only if user is a manager of account
	 */
	async throwIfUserNotAManagerOfAccount(
		...params: Parameters<typeof this.isUserManagerOfAccount>
	) {
		const check = await this.isUserManagerOfAccount(...params);

		if (!check) {
			throw new UserNotAccountManagerError();
		}
	}
}
