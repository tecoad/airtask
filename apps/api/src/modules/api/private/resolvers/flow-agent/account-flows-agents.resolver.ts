import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { flow_agent } from '@prisma/client';
import {
	AccountUsageKind,
	CreateFlowAgentInput,
	UpdateFlowAgentInput,
} from 'src/graphql';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { FlowsAgentsService } from 'src/modules/flows/services/flows-agents.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';
import { EntityNotFoundError } from 'src/shared/errors/entity-not-found.error';
import { ID } from 'src/shared/types/db';

@Resolver('FlowAgent')
export class AccountFlowsAgentsResolvers {
	constructor(
		private readonly flowsAgentsService: FlowsAgentsService,
		private readonly prisma: PrismaService,
		private readonly accountPermissionManager: AccountPermissionsManagerService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	async accountFlowAgent(@CurrentUser() user: UserJwtPayload, @Args('id') id: ID) {
		const agent = await this.flowsAgentsService.find(id);

		agent &&
			(await this.accountPermissionManager.throwIfUserIsNotAllowedToReadModuleInAccount(
				user.id,
				agent.account,
				AccountUsageKind.flow,
			));

		return agent;
	}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	async accountFlowAgents(
		@CurrentUser() user: UserJwtPayload,
		@Args('account') account: ID,
	) {
		await this.accountPermissionManager.throwIfUserIsNotAllowedToReadModuleInAccount(
			user.id,
			Number(account),
			AccountUsageKind.flow,
		);

		return this.flowsAgentsService.listForAccount(Number(account));
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async createFlowAgent(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: CreateFlowAgentInput,
	) {
		await this.accountPermissionManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			Number(input.account),
			AccountUsageKind.flow,
		);

		return this.flowsAgentsService.create(input);
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async updateFlowAgent(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: UpdateFlowAgentInput,
	) {
		const agent = await this.prisma.flow_agent.findUnique({
				where: {
					id: input.id,
				},
				include: {
					account_flow_agent_accountToaccount: true,
				},
			}),
			account = agent?.account_flow_agent_accountToaccount;

		if (!agent) throw new EntityNotFoundError('flow_agent', input.id);
		if (!account) throw new Error('Flow agent without account');

		await this.accountPermissionManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			account.id,
			AccountUsageKind.flow,
		);

		return this.flowsAgentsService.update(input, agent);
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async deleteFlowAgent(@CurrentUser() user: UserJwtPayload, @Args('id') id: ID) {
		const agent = await this.prisma.flow_agent.findUnique({
				where: { id: String(id) },
				include: {
					account_flow_agent_accountToaccount: true,
				},
			}),
			account = agent?.account_flow_agent_accountToaccount;

		if (!agent || !account) return false;

		await this.accountPermissionManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			account.id,
			AccountUsageKind.flow,
		);

		await this.flowsAgentsService.softDelete(id);

		return true;
	}

	@ResolveField()
	knowledge_base(@Parent() agent: flow_agent) {
		return (
			agent.knowledge_base &&
			this.prisma.knowledge_base.findUnique({ where: { id: agent.knowledge_base } })
		);
	}
}
