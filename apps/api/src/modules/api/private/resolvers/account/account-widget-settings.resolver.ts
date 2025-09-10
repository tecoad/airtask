import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { WidgetConfigInput } from 'src/graphql';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';
import { UserNotAAccountMemberError } from 'src/shared/errors';
import { ID } from 'src/shared/types/db';
import { WidgetConfigService } from '../../../../quotations/services/widget-config.service';

@Resolver('WidgetConfig')
export class AccountWidgetSettingsResolver {
	constructor(
		private readonly accountPermissionManager: AccountPermissionsManagerService,
		private readonly widgetConfigService: WidgetConfigService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async updateAccountWidgetConfig(
		@CurrentUser() user: UserJwtPayload,
		@Args('accountId') accountId: ID,
		@Args('input') input: WidgetConfigInput,
	) {
		if (
			!(await this.accountPermissionManager.isUserMemberOfAccount(
				user.id,
				Number(accountId),
			))
		) {
			throw new UserNotAAccountMemberError();
		}

		const result = await this.widgetConfigService.updateForAccount(
			Number(accountId),
			input,
		);

		this.widgetConfigService.revalidateWidgetConfigForAccount(Number(accountId));
		return result;
	}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	async accountWidgetSettings(
		@CurrentUser() user: UserJwtPayload,
		@Args('accountId') accountId: ID,
	) {
		if (
			!(await this.accountPermissionManager.isUserMemberOfAccount(
				user.id,
				Number(accountId),
			))
		) {
			throw new UserNotAAccountMemberError();
		}

		return this.widgetConfigService.findForAccount(Number(accountId));
	}
}
