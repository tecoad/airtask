import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { knowledge_base_qa } from '@prisma/client';
import { CreateKnowledgeBaseQAInput, UpdateKnowledgeBaseQAInput } from 'src/graphql';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { KnowledgeBaseQAService } from 'src/modules/knowledgebase/services/knowledge-base-qa.service';
import { KnowledgeBaseService } from 'src/modules/knowledgebase/services/knowledge-base.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';
import { EntityNotFoundError } from 'src/shared/errors';
import { ID } from 'src/shared/types/db';
import { unique } from 'src/shared/utils/array';

@Resolver('KnowledgeBaseQA')
export class KnowledgeBaseQAResolver {
	constructor(
		private readonly prisma: PrismaService,
		private readonly knowledgeBaseService: KnowledgeBaseService,
		private readonly knowledgeBaseQAService: KnowledgeBaseQAService,
		private readonly accountPermissionsManager: AccountPermissionsManagerService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async createKnowledgeBaseQA(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') _input: CreateKnowledgeBaseQAInput[],
	) {
		const input = Array.isArray(_input) ? _input : [_input];

		const allKnowledgeBaseInputIds = unique(input.flatMap((v) => v.knowledge_base_id));

		if (!allKnowledgeBaseInputIds.length) {
			throw new Error('error.knowledge-base-qa-must-have-at-least-one-knowledge-base');
		}

		const allKnowledgeBases = await this.prisma.knowledge_base.findMany({
			where: {
				id: {
					in: allKnowledgeBaseInputIds,
				},
			},
			select: {
				id: true,
				account: true,
			},
		});

		// All the knowledge bases must be in the same account
		for (const item of allKnowledgeBases) {
			const withDifferentAccount = allKnowledgeBases.find(
				(i) => i.account !== item.account,
			);

			if (withDifferentAccount) {
				throw new Error('error.found-knowledge-bases-with-different-accounts');
			}
		}

		// Because we now all the knowledgeBases are from the same account now, we cant do a single query
		const accountId = allKnowledgeBases[0].account;
		await this.accountPermissionsManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			accountId,
		);

		const result: knowledge_base_qa[] = [];

		for (const itemInput of input) {
			result.push(await this.knowledgeBaseQAService.create(accountId, itemInput));
		}

		return result;
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async updateKnowledgeBaseQA(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: UpdateKnowledgeBaseQAInput,
	) {
		const item = await this.knowledgeBaseQAService.find(input.id);

		if (!item) throw new EntityNotFoundError('knowledge_base_qa', input.id);

		await this.accountPermissionsManager.throwIfUserIsNotAllowedToManageModuleInAccount(
			user.id,
			Number(item.account),
		);

		if (input.knowledge_base_id) {
			for (const knowLedgeBaseId of input.knowledge_base_id) {
				const base = await this.knowledgeBaseService.find(knowLedgeBaseId);

				if (!base) throw new EntityNotFoundError('knowledge_base', knowLedgeBaseId);

				// We now user is a manager of item account because of the check above
				// so we can check if the knowledge base is from the same account
				if (base.account !== item.account) {
					throw new Error('error.found-knowledge-bases-with-different-accounts');
				}
			}
		}

		return this.knowledgeBaseQAService.update(input);
	}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	async knowledgeBaseQA(@CurrentUser() user: UserJwtPayload, @Args('id') id: ID) {
		const item = await this.knowledgeBaseQAService.find(id);

		if (!item) return null;

		await this.accountPermissionsManager.throwIfUserIsNotAllowedToReadModuleInAccount(
			user.id,
			Number(item.account),
		);

		return item;
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async deleteKnowledgeBaseQA(
		@CurrentUser() user: UserJwtPayload,
		@Args('id') _id: ID[],
	) {
		const ids = Array.isArray(_id) ? _id : [_id];

		for (const id of ids) {
			const item = await this.knowledgeBaseQAService.find(id);

			if (!item) continue;

			await this.accountPermissionsManager.throwIfUserIsNotAllowedToManageModuleInAccount(
				user.id,
				Number(item.account),
			);

			await this.knowledgeBaseQAService.delete(id);
		}

		return true;
	}

	@ResolveField()
	knowledge_base(@Parent() parent: knowledge_base_qa) {
		return this.knowledgeBaseQAService.listKnowledgeBases(parent.id);
	}
}
