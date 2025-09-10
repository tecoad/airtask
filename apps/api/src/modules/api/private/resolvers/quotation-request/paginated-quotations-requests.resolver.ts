import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { AccountQuotationsRequestsService } from 'src/modules/quotations/services/account-quotations-requests.service';

import { ID } from '@directus/sdk';
import { UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
	AccountUsageKind,
	FilterOperator,
	PaginatedQuotationRequestListOptions,
	QuotationRequestFilter,
} from 'src/graphql';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';
import { UnwrapPromise } from 'src/shared/utils/generics';

@Resolver('PaginatedQuotationRequestList')
export class PaginatedQuotationRequestListResolver {
	constructor(
		private readonly accountQuotationsRequestsService: AccountQuotationsRequestsService,
		private readonly accountPermissionsService: AccountPermissionsManagerService,
		private readonly prisma: PrismaService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	async accountQuotationRequests(
		@CurrentUser() user: UserJwtPayload,
		@Args('accountId') accountId: ID,
		@Args('pagination') pagination?: PaginatedQuotationRequestListOptions,
		@Args('filter') filter?: QuotationRequestFilter,
	) {
		await this.accountPermissionsService.throwIfUserIsNotAllowedToReadModuleInAccount(
			user.id,
			Number(accountId),
			AccountUsageKind.quotation,
		);

		// Fields will
		return {
			pagination,
			accountId,
			filter,
		};
	}

	@ResolveField('items')
	async items(
		@Parent()
		parent: UnwrapPromise<ReturnType<(typeof this)['accountQuotationRequests']>>,
	) {
		return this.accountQuotationsRequestsService.listAll(parent.accountId, {
			skip: parent.pagination?.skip as number,
			take: parent.pagination?.take as number,
			orderBy: parent.pagination
				?.sort as Prisma.quotation_requestOrderByWithRelationInput,
			where: parent.filter && this.filterConditionsToWhereRule(parent.filter),
		});
	}

	@ResolveField('totalItems')
	async totalItems(
		@Parent()
		parent: UnwrapPromise<ReturnType<(typeof this)['accountQuotationRequests']>>,
	) {
		return this.accountQuotationsRequestsService.count(
			parent.accountId,
			parent.filter ? this.filterConditionsToWhereRule(parent.filter) : {},
		);
	}

	filterConditionsToWhereRule(
		filterConditions: QuotationRequestFilter,
	): Prisma.quotation_requestFindManyArgs['where'] {
		return {
			// Use operator
			[filterConditions.operator === FilterOperator.and ? 'AND' : 'OR']: <
				Prisma.quotation_requestWhereInput[]
			>[
				{
					...(filterConditions?.quotation
						? { quotation: String(filterConditions.quotation) }
						: {}),
				},
				{
					...(filterConditions?.recipientQuery
						? {
								quotation_conversation_quotation_request_quotation_conversationToquotation_conversation:
									{
										OR: [
											{
												recipient_email: {
													in: filterConditions.recipientQuery.split(' '),
													mode: 'insensitive',
												},
											},
											{
												recipient_first_name: {
													in: filterConditions.recipientQuery.split(' '),
													mode: 'insensitive',
												},
											},
											{
												recipient_last_name: {
													contains: filterConditions.recipientQuery,
													mode: 'insensitive',
												},
											},
											{
												recipient_phone: {
													contains: filterConditions.recipientQuery,
													mode: 'insensitive',
												},
											},
										],
									},
						  }
						: {}),
				},
				{
					...([true, false].includes(filterConditions.is_checked!)
						? {
								checked_at: filterConditions.is_checked
									? {
											not: null,
									  }
									: null,
						  }
						: {}),
				},
			],
		};
	}
}
