import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AccountUsageKind, CreateFlowCalendarIntegrationInput } from 'src/graphql';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { FlowCalendarIntegrationService } from 'src/modules/flows/services/flow-calendar-integration.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';

@Resolver()
export class FlowCalendarIntegrationResolver {
	constructor(
		private readonly flowCalendarIntegrationService: FlowCalendarIntegrationService,
		private readonly accountPermissionsManager: AccountPermissionsManagerService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async createFlowCalendarIntegration(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: CreateFlowCalendarIntegrationInput,
	) {
		await this.accountPermissionsManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			Number(input.account),
			AccountUsageKind.flow,
		);

		return this.flowCalendarIntegrationService.create(input);
	}
}
