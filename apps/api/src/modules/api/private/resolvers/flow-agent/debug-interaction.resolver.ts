import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
	AccountUsageKind,
	CreateDebugInteractionInput,
	CreateDebugInteractionResult,
	DebugInteractionErrorCode,
} from 'src/graphql';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { FlowInteractionService } from 'src/modules/flows/services/flow-interaction.service';
import { FlowsAgentsService } from 'src/modules/flows/services/flows-agents.service';
import { UsageManagerService } from 'src/modules/subscriptions/services/usage-manager.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';
import { EntityNotFoundError } from 'src/shared/errors';

@Resolver()
export class FlowAgentDebugInteractionResolver {
	constructor(
		private readonly flowAgentsService: FlowsAgentsService,
		private readonly flowInteractionService: FlowInteractionService,
		private readonly accountPermissionsManager: AccountPermissionsManagerService,
		private readonly usageManagerService: UsageManagerService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async createDebugInteraction(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: CreateDebugInteractionInput,
	): Promise<CreateDebugInteractionResult> {
		const agent = await this.flowAgentsService.find(input.agentId);

		if (!agent) throw new EntityNotFoundError('flow_agent', input.agentId);

		await this.accountPermissionsManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			agent.account,
			AccountUsageKind.flow,
		);

		if (
			!(await this.usageManagerService.isAccountAllowedToPerformOperation(
				agent.account,
				AccountUsageKind.flow,
				1,
			))
		) {
			return {
				errorCode: DebugInteractionErrorCode.INSUFFICIENT_FUNDS,
				message: 'Insufficient funds to perform this operation.',
			};
		}

		return this.flowInteractionService.createOutboundInteraction(
			{
				agentId: agent.id,
				interactionData: {
					phoneNumber: input.phoneNumber,
					prospectName: input.prospectName,
				},
				debugAsInbound: input.debugAsInbound,
			},
			agent,
		);
	}
}
