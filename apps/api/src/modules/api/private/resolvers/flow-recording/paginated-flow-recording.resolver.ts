import { ID } from '@directus/sdk';
import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { UnwrapPromise } from '@prisma/client/runtime/library';
import {
	AccountUsageKind,
	FilterOperator,
	FlowRecordingListFilter,
	PaginatedFlowRecordingListOptions,
} from 'src/graphql';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { FlowRecordingsService } from 'src/modules/flows/services/flow-recordings.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';

@Resolver('PaginatedFlowRecordingList')
export class PaginatedFlowRecordingsResolver {
	constructor(
		private readonly accountPermissionsManager: AccountPermissionsManagerService,
		private readonly flowRecordingsService: FlowRecordingsService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	async flowRecordings(
		@CurrentUser() user: UserJwtPayload,
		@Args('accountId') accountId: ID,
		@Args('pagination') pagination?: PaginatedFlowRecordingListOptions,
		@Args('filter') filter?: FlowRecordingListFilter,
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
		parent: UnwrapPromise<ReturnType<(typeof this)['flowRecordings']>>,
	) {
		return this.flowRecordingsService.listAll(parent.accountId, {
			skip: parent.pagination?.skip as number,
			take: parent.pagination?.take as number,
			orderBy: parent.pagination
				?.sort as Prisma.flow_interaction_recordingOrderByWithRelationInput,
			where: parent.filter && this.filterConditionsToWhereRule(parent.filter),
		});
	}

	@ResolveField()
	async totalItems(
		@Parent()
		parent: UnwrapPromise<ReturnType<(typeof this)['flowRecordings']>>,
	) {
		return this.flowRecordingsService.count(
			parent.accountId,
			parent.filter ? this.filterConditionsToWhereRule(parent.filter) : {},
		);
	}

	filterConditionsToWhereRule(
		filterConditions: FlowRecordingListFilter,
	): Prisma.flow_interaction_recordingWhereInput {
		return {
			[filterConditions.operator === FilterOperator.and ? 'AND' : 'OR']: <
				Prisma.flow_interaction_recordingWhereInput
			>[
				{
					flow_interaction: filterConditions.flow
						? <Prisma.flow_interaction_recordingWhereInput['flow_interaction']>{
								flow: filterConditions.flow,
						  }
						: undefined,
				},
				{
					duration: filterConditions.duration,
				},
				{
					date_created: filterConditions.date_created,
				},
				// Contact search can be my filter_interaction.contact_name or phone
				{
					flow_interaction: filterConditions.contact_search
						? {
								OR: [
									{
										contact_name: {
											contains: filterConditions.contact_search,
											mode: 'insensitive',
										},
									},
									{
										contact_phone: {
											contains: filterConditions.contact_search,
											mode: 'insensitive',
										},
									},
								],
						  }
						: undefined,
				},
			],
		};
	}
}
