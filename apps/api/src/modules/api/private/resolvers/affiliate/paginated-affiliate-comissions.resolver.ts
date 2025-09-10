import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import {
	AffiliateComissionsListFilter,
	FilterOperator,
	PaginatedAffiliateComissionListOptions,
} from 'src/graphql';
import { AffiliateComissionsService } from 'src/modules/affiliates/services/affiliate-comissions.service';
import { AffiliatesService } from 'src/modules/affiliates/services/affiliates.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';
import { UnwrapPromise } from 'src/shared/utils/generics';

@Resolver('PaginatedAffiliateComissionList')
export class PaginatedAffiliateComissionResolver {
	constructor(
		private readonly affiliateComissionService: AffiliateComissionsService,
		private readonly affiliateService: AffiliatesService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	async affiliateComissions(
		@CurrentUser() user: UserJwtPayload,
		@Args('pagination') pagination?: PaginatedAffiliateComissionListOptions,
		@Args('filter') filter?: AffiliateComissionsListFilter,
	) {
		const affiliate = await this.affiliateService.findAffiliateByUserId(user.id);

		if (!affiliate) throw new Error('error.user-is-not-a-affiliate');

		return {
			affiliate,
			pagination,
			filter,
		};
	}

	@ResolveField()
	async items(
		@Parent()
		parent: UnwrapPromise<ReturnType<(typeof this)['affiliateComissions']>>,
	) {
		return this.affiliateComissionService.listAll(parent.affiliate!.id, {
			skip: parent.pagination?.skip as number,
			take: parent.pagination?.take as number,
			orderBy: parent.pagination
				?.sort as Prisma.affiliate_comissionOrderByWithRelationInput,
			where: parent.filter && this.filterConditionsToWhereRule(parent.filter),
		});
	}

	@ResolveField()
	async totalItems(
		@Parent()
		parent: UnwrapPromise<ReturnType<(typeof this)['affiliateComissions']>>,
	) {
		return this.affiliateComissionService.count(
			parent.affiliate!.id,
			parent.filter ? this.filterConditionsToWhereRule(parent.filter) : {},
		);
	}

	filterConditionsToWhereRule(
		filterConditions: AffiliateComissionsListFilter,
	): Prisma.affiliate_comissionWhereInput {
		return {
			[filterConditions.operator === FilterOperator.and ? 'AND' : 'OR']: <
				Prisma.affiliate_comissionWhereInput
			>[
				{
					status: filterConditions.status,
				},
			],
		};
	}
}
