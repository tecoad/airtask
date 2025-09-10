import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { knowledge_base } from '@prisma/client';
import { CreateKnowledgeBaseInput, UpdateKnowledgeBaseInput } from 'src/graphql';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { KnowledgeBaseService } from 'src/modules/knowledgebase/services/knowledge-base.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';
import { EntityNotFoundError } from 'src/shared/errors';
import { ID } from 'src/shared/types/db';

@Resolver('KnowledgeBase')
export class KnowledgeBaseResolver {
	constructor(
		private readonly prisma: PrismaService,
		private readonly knowledgeBaseService: KnowledgeBaseService,
		private readonly accountPermissionsManager: AccountPermissionsManagerService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async createKnowledgeBase(
		@CurrentUser() user: UserJwtPayload,
		@Args('accountId') accountId: ID,
		@Args('input') input: CreateKnowledgeBaseInput,
	) {
		await this.accountPermissionsManager.throwIfUserIsNotAllowedToReadModuleInAccount(
			user.id,
			Number(accountId),
		);

		return this.knowledgeBaseService.create(accountId, input);
	}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	async knowledgeBase(@CurrentUser() user: UserJwtPayload, @Args('id') id: ID) {
		const item = await this.knowledgeBaseService.find(id);

		if (!item) return null;

		await this.accountPermissionsManager.throwIfUserIsNotAllowedToReadModuleInAccount(
			user.id,
			Number(item.account),
		);

		return item;
	}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	async accountKnowledgeBases(
		@CurrentUser() user: UserJwtPayload,
		@Args('accountId') accountId: ID,
	) {
		await this.accountPermissionsManager.throwIfUserIsNotAllowedToReadModuleInAccount(
			user.id,
			Number(accountId),
		);

		return this.knowledgeBaseService.listByAccount(accountId);
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async updateKnowledge(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: UpdateKnowledgeBaseInput,
	) {
		const item = await this.knowledgeBaseService.find(input.id);

		if (!item) throw new EntityNotFoundError('knowledge_base', input.id);

		await this.accountPermissionsManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			Number(item.account),
		);

		return this.knowledgeBaseService.update(input);
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async deleteKnowledgeBase(@CurrentUser() user: UserJwtPayload, @Args('id') id: ID) {
		const item = await this.knowledgeBaseService.find(id);

		if (!item) return null;

		await this.accountPermissionsManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			Number(item.account),
		);

		return this.knowledgeBaseService.delete(id);
	}

	@ResolveField()
	qa(@Parent() parent: knowledge_base) {
		return this.knowledgeBaseService.listQAs(parent.id);
	}
}
