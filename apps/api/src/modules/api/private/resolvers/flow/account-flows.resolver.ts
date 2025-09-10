import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { flow } from '@prisma/client';
import { AccountUsageKind, CreateFlowInput, UpdateFlowInput } from 'src/graphql';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { FlowsAgentsService } from 'src/modules/flows/services/flows-agents.service';
import { FlowsContactsSegmentsService } from 'src/modules/flows/services/flows-contacts-segments.service';
import { FlowsService } from 'src/modules/flows/services/flows.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';
import { EntityNotFoundError } from 'src/shared/errors/entity-not-found.error';
import { ID } from 'src/shared/types/db';

@Resolver('Flow')
export class AccountFlowsResolver {
	constructor(
		private readonly flowsService: FlowsService,
		private readonly flowsAgentsService: FlowsAgentsService,
		private readonly flowsContactsSegmentsService: FlowsContactsSegmentsService,
		private readonly prisma: PrismaService,
		private readonly accountPermissionManager: AccountPermissionsManagerService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	async accountFlow(@CurrentUser() user: UserJwtPayload, @Args('id') id: ID) {
		const flow = await this.flowsService.find(id);

		flow &&
			(await this.accountPermissionManager.throwIfUserIsNotAllowedToReadModuleInAccount(
				user.id,
				flow.account,
				AccountUsageKind.flow,
			));

		return flow;
	}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	async accountFlows(
		@CurrentUser() user: UserJwtPayload,
		@Args('accountId') accountId: ID,
	) {
		await this.accountPermissionManager.throwIfUserIsNotAllowedToReadModuleInAccount(
			user.id,
			Number(accountId),
			AccountUsageKind.flow,
		);

		return this.flowsService.listForAccount(Number(accountId));
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async createFlow(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: CreateFlowInput,
	) {
		await this.accountPermissionManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			Number(input.account),
			AccountUsageKind.flow,
		);

		return this.flowsService.create(input);
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async updateFlow(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: UpdateFlowInput,
	) {
		const flow = await this.prisma.flow.findUnique({
				where: {
					id: input.id,
				},
				include: {
					account_flow_accountToaccount: true,
				},
			}),
			account = flow?.account_flow_accountToaccount;

		if (!flow) throw new EntityNotFoundError('flow', input.id);
		if (!account) throw new Error('Flow without account');

		await this.accountPermissionManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			account.id,
			AccountUsageKind.flow,
		);

		return this.flowsService.update(input, flow);
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async deleteFlow(@CurrentUser() user: UserJwtPayload, @Args('id') id: ID) {
		const flow = await this.prisma.flow.findUnique({
				where: { id: String(id) },
				include: {
					account_flow_accountToaccount: true,
				},
			}),
			account = flow?.account_flow_accountToaccount;

		if (!flow || !account) return false;

		await this.accountPermissionManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			account.id,
			AccountUsageKind.flow,
		);

		await this.flowsService.softDelete(id);

		return true;
	}

	@ResolveField()
	agent(@Parent() flow: flow) {
		return flow.agent && this.flowsAgentsService.find(flow.agent);
	}

	@ResolveField()
	segment(@Parent() flow: flow) {
		return flow.segment && this.flowsContactsSegmentsService.find(flow.segment);
	}
}
