import { Injectable } from '@nestjs/common';
import { ValidationError } from 'apollo-server-express';
import { CreateKnowledgeBaseInput, UpdateKnowledgeBaseInput } from 'src/graphql';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { ID } from 'src/shared/types/db';
import { v4 } from 'uuid';
import { KnowledgeBaseQAService } from './knowledge-base-qa.service';

@Injectable()
export class KnowledgeBaseService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly knowledgebaseQaService: KnowledgeBaseQAService,
	) {}

	create(accountId: ID, input: CreateKnowledgeBaseInput) {
		return this.prisma.knowledge_base.create({
			data: {
				id: v4(),
				account: Number(accountId),
				...input,
			},
		});
	}

	update(input: UpdateKnowledgeBaseInput) {
		const { id, ...rest } = input;

		if (rest.title === null || rest.type === null) {
			throw new ValidationError('title and type are required');
		}

		return this.prisma.knowledge_base.update({
			where: {
				id: String(id),
			},
			data: {
				title: rest.title,
				type: rest.type,
			},
		});
	}

	find(id: ID) {
		return this.prisma.knowledge_base.findUnique({
			where: {
				id: String(id),
			},
		});
	}

	async listByAccount(accountId: ID) {
		return this.prisma.knowledge_base.findMany({
			where: {
				account: Number(accountId),
			},
		});
	}

	async delete(id: ID) {
		const qasInThisKnowledgeBase =
			await this.prisma.knowledge_base_qa_knowledge_base.findMany({
				where: {
					knowledge_base_id: String(id),
				},
			});

		for (const qaInThisKnowledgeBase of qasInThisKnowledgeBase) {
			const isThisQAOnlyInThisKnowledgeBase =
				(await this.prisma.knowledge_base_qa_knowledge_base.count({
					where: {
						knowledge_base_qa_id: qaInThisKnowledgeBase.knowledge_base_qa_id,
					},
				})) === 1;

			if (isThisQAOnlyInThisKnowledgeBase) {
				await this.knowledgebaseQaService.delete(
					qaInThisKnowledgeBase.knowledge_base_qa_id!,
				);
			} else {
				await this.prisma.knowledge_base_qa_knowledge_base.delete({
					where: {
						id: qaInThisKnowledgeBase.id,
					},
				});
			}
		}

		await this.prisma.knowledge_base.delete({
			where: {
				id: String(id),
			},
		});

		return true;
	}

	async listQAs(knowledgeBaseId: string) {
		const m2m = await this.prisma.knowledge_base_qa_knowledge_base.findMany({
			where: {
				knowledge_base_id: knowledgeBaseId,
			},
			include: {
				knowledge_base_qa: true,
			},
		});

		return m2m.flatMap((v) => (v.knowledge_base_qa ? v.knowledge_base_qa : []));
	}
}
