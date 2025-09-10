import { ID } from '@directus/sdk';
import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import {
	AccountUsageKind,
	FilterOperator,
	FlowContactListFilter,
	PaginatedFlowContactListOptions,
} from 'src/graphql';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { FlowsContactsService } from 'src/modules/flows/services/flows-contacts.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';
import { UnwrapPromise } from 'src/shared/utils/generics';

@Resolver('PaginatedFlowContactsList')
export class PaginatedFlowContactsResolver {
	constructor(
		private readonly flowsContactsService: FlowsContactsService,
		private readonly accountPermissionsManager: AccountPermissionsManagerService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	async accountFlowContacts(
		@CurrentUser() user: UserJwtPayload,
		@Args('accountId') accountId: ID,
		@Args('pagination') pagination?: PaginatedFlowContactListOptions,
		@Args('filter') filter?: FlowContactListFilter,
	) {
		await this.accountPermissionsManager.throwIfUserIsNotAllowedToReadModuleInAccount(
			user.id,
			Number(accountId),
			AccountUsageKind.flow,
		);

		return {
			pagination,
			filter,
			accountId,
		};
	}

	@ResolveField()
	async items(
		@Parent()
		parent: UnwrapPromise<ReturnType<(typeof this)['accountFlowContacts']>>,
	) {
		return this.flowsContactsService.listAll(parent.accountId, {
			skip: parent.pagination?.skip as number,
			take: parent.pagination?.take as number,
			orderBy: parent.pagination?.sort as Prisma.flow_contactOrderByWithRelationInput,
			where: parent.filter && this.filterConditionsToWhereRule(parent.filter),
		});
	}

	@ResolveField()
	async totalItems(
		@Parent()
		parent: UnwrapPromise<ReturnType<(typeof this)['accountFlowContacts']>>,
	) {
		return this.flowsContactsService.count(
			parent.accountId,
			parent.filter ? this.filterConditionsToWhereRule(parent.filter) : {},
		);
	}

	filterConditionsToWhereRule(
		filterConditions: FlowContactListFilter,
	): Prisma.flow_contactWhereInput {
		return {
			[filterConditions.operator === FilterOperator.and ? 'AND' : 'OR']: <
				Prisma.flow_contactWhereInput
			>[
				{
					status: filterConditions.status,
				},
				{
					flow_contact_flow_contact_segment: filterConditions.segment
						? <Prisma.Flow_contact_flow_contact_segmentListRelationFilter>{
								some: {
									flow_contact_segment_id: filterConditions.segment,
								},
						  }
						: undefined,
				},
				{
					...(filterConditions.search
						? {
								OR: <Prisma.flow_contactWhereInput[]>[
									{
										first_name: {
											in: filterConditions.search.split(' '),
											mode: 'insensitive',
										},
									},
									{
										last_name: {
											in: filterConditions.search.split(' '),
											mode: 'insensitive',
										},
									},
									{
										email: {
											contains: filterConditions.search,
											mode: 'insensitive',
										},
									},
									{
										phone: {
											contains: filterConditions.search,
											mode: 'insensitive',
										},
									},
								],
						  }
						: {}),
				},
			],
		};
	}
}
