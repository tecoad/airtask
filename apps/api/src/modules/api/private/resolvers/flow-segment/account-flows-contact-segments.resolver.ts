import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { flow_contact_segment } from '@prisma/client';
import {
	AccountUsageKind,
	CreateFlowContactSegmentInput,
	UpdateFlowContactSegmentInput,
} from 'src/graphql';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { FlowsContactsSegmentsService } from 'src/modules/flows/services/flows-contacts-segments.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';
import { EntityNotFoundError } from 'src/shared/errors/entity-not-found.error';
import { ID } from 'src/shared/types/db';

@Resolver('FlowContactSegment')
export class AccountFlowsContactSegmentsResolvers {
	constructor(
		private readonly flowsContactsSegmentsService: FlowsContactsSegmentsService,
		private readonly prisma: PrismaService,
		private readonly accountPermissionManager: AccountPermissionsManagerService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	async accountFlowSegment(@CurrentUser() user: UserJwtPayload, @Args('id') id: ID) {
		const segment = await this.flowsContactsSegmentsService.find(id);

		segment &&
			(await this.accountPermissionManager.throwIfUserIsNotAllowedToReadModuleInAccount(
				user.id,
				segment.account,
				AccountUsageKind.flow,
			));

		return segment;
	}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	async accountFlowSegments(
		@CurrentUser() user: UserJwtPayload,
		@Args('account') accountId: ID,
	) {
		await this.accountPermissionManager.throwIfUserIsNotAllowedToReadModuleInAccount(
			user.id,
			Number(accountId),
			AccountUsageKind.flow,
		);

		return this.flowsContactsSegmentsService.listForAccount(Number(accountId));
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async createFlowContactSegment(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: CreateFlowContactSegmentInput,
	) {
		await this.accountPermissionManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			Number(input.account),
			AccountUsageKind.flow,
		);

		return this.flowsContactsSegmentsService.create(input);
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async updateFlowContactSegment(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: UpdateFlowContactSegmentInput,
	) {
		const segment = await this.prisma.flow_contact_segment.findUnique({
				where: {
					id: input.id,
				},
				include: {
					account_flow_contact_segment_accountToaccount: true,
				},
			}),
			account = segment?.account_flow_contact_segment_accountToaccount;

		if (!segment) throw new EntityNotFoundError('flow_agent', input.id);

		if (!account) throw new Error('flow without account');

		await this.accountPermissionManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			account.id,
			AccountUsageKind.flow,
		);

		return this.flowsContactsSegmentsService.update(input);
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async deleteFlowSegment(@CurrentUser() user: UserJwtPayload, @Args('id') id: ID) {
		const segment = await this.prisma.flow_contact_segment.findUnique({
				where: {
					id: String(id),
				},
				include: {
					account_flow_contact_segment_accountToaccount: true,
				},
			}),
			account = segment?.account_flow_contact_segment_accountToaccount;

		if (!segment || !account) return false;

		await this.accountPermissionManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			account.id,
			AccountUsageKind.flow,
		);

		await this.flowsContactsSegmentsService.softDelete(id);

		return true;
	}

	@ResolveField()
	flow_contacts_count(@Parent() segment: flow_contact_segment) {
		return this.prisma.flow_contact.count({
			where: {
				flow_contact_flow_contact_segment: {
					some: {
						flow_contact_segment_id: segment.id,
					},
				},
			},
		});
	}

	@ResolveField()
	flow_instances_count(@Parent() segment: flow_contact_segment) {
		return this.prisma.flow.count({
			where: {
				segment: segment.id,
			},
		});
	}
}
