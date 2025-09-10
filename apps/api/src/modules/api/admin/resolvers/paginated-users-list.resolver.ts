import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { UnwrapPromise } from '@prisma/client/runtime/library';
import {
	FilterOperator,
	PaginatedUsersListOptions,
	Permissions,
	UsersListFilter,
} from 'src/admin-graphql';
import { AdminUsersManagerService } from 'src/modules/admin/services/users-manager.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { Allow } from 'src/shared/decorators/permissions';

@Resolver('PaginatedUsersList')
export class PaginatedUsersListResolver {
	constructor(private readonly adminUsersManagerService: AdminUsersManagerService) {}

	@Allow(Permissions.ListUsers)
	@UseGuards(UserGqlAuthGuard)
	@Query()
	async users(
		@Args('pagination') pagination?: PaginatedUsersListOptions,
		@Args('filter') filter?: UsersListFilter,
	) {
		return { pagination, filter };
	}

	@ResolveField('items')
	async items(
		@Parent()
		parent: UnwrapPromise<ReturnType<(typeof this)['users']>>,
	) {
		return this.adminUsersManagerService.listAll({
			skip: parent.pagination?.skip as number,
			take: parent.pagination?.take as number,
			orderBy: parent.pagination?.sort as Prisma.userOrderByWithRelationInput,
			where: parent.filter && this.filterConditionsToWhereRule(parent.filter),
		});
	}

	@ResolveField('totalItems')
	async totalItems(
		@Parent()
		parent: UnwrapPromise<ReturnType<(typeof this)['users']>>,
	) {
		return this.adminUsersManagerService.count(
			parent.filter ? this.filterConditionsToWhereRule(parent.filter) : {},
		);
	}

	filterConditionsToWhereRule(
		filterConditions: UsersListFilter,
	): Prisma.userFindManyArgs['where'] {
		return {
			// Use operator
			[filterConditions.operator === FilterOperator.and ? 'AND' : 'OR']: <
				Prisma.userWhereInput[]
			>[
				{
					...(filterConditions?.mainQuery
						? {
								OR: <Prisma.userWhereInput[]>[
									{
										first_name: {
											in: filterConditions.mainQuery.split(' '),
											mode: 'insensitive',
										},
									},
									{
										last_name: {
											in: filterConditions.mainQuery.split(' '),
											mode: 'insensitive',
										},
									},
									{
										email: {
											contains: filterConditions.mainQuery,
											mode: 'insensitive',
										},
									},
									{
										anonymous_id: {
											contains: filterConditions.mainQuery,
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
