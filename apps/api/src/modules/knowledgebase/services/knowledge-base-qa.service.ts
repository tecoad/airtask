import { Injectable } from '@nestjs/common';
import { ValidationError } from 'apollo-server-express';
import { CreateKnowledgeBaseQAInput, UpdateKnowledgeBaseQAInput } from 'src/graphql';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { ID } from 'src/shared/types/db';
import { v4 } from 'uuid';

@Injectable()
export class KnowledgeBaseQAService {
	constructor(private readonly prisma: PrismaService) {}

	create(accountId: ID, input: CreateKnowledgeBaseQAInput) {
		const { knowledge_base_id, ...rest } = input;

		return this.prisma.knowledge_base_qa.create({
			data: {
				id: v4(),
				account: Number(accountId),
				...rest,
				knowledge_base_qa_knowledge_base: {
					create: knowledge_base_id.map((v) => ({
						knowledge_base_id: v,
					})),
				},
			},
		});
	}

	async listKnowledgeBases(knowledgeBaseQaId: ID) {
		const m2m = await this.prisma.knowledge_base_qa_knowledge_base.findMany({
			where: {
				knowledge_base_qa_id: String(knowledgeBaseQaId),
			},
			include: {
				knowledge_base: true,
			},
		});

		return m2m.flatMap((v) => (v.knowledge_base ? v.knowledge_base : []));
	}

	find(id: ID) {
		return this.prisma.knowledge_base_qa.findUnique({ where: { id: String(id) } });
	}

	async update(input: UpdateKnowledgeBaseQAInput) {
		const { id, knowledge_base_id, ...rest } = input;

		if (rest.answer === null || rest.question === null) {
			throw new ValidationError('Answers and questions cannot be null');
		}

		if (knowledge_base_id) {
			const currentBasesM2MForThisQA =
				await this.prisma.knowledge_base_qa_knowledge_base.findMany({
					where: {
						knowledge_base_qa_id: String(input.id),
					},
				});

			const newBases = knowledge_base_id.filter(
				(i) => !currentBasesM2MForThisQA.find((v) => v.knowledge_base_id === i),
			);
			const deletedBases = currentBasesM2MForThisQA.filter(
				(i) => !knowledge_base_id.find((v) => v === i.knowledge_base_id),
			);

			if (newBases.length) {
				await this.prisma.knowledge_base_qa_knowledge_base.createMany({
					data: newBases.map((v) => ({
						knowledge_base_id: v,
						knowledge_base_qa_id: String(input.id),
					})),
				});
			}
			if (deletedBases.length) {
				await this.prisma.knowledge_base_qa_knowledge_base.deleteMany({
					where: {
						knowledge_base_qa_id: String(input.id),
						knowledge_base_id: {
							in: deletedBases.map((v) => v.knowledge_base_id!),
						},
					},
				});
			}
		}

		return this.prisma.knowledge_base_qa.update({
			where: {
				id: String(id),
			},
			data: {
				answer: rest.answer,
				question: rest.question,
			},
		});
	}

	async delete(id: ID) {
		await this.prisma.knowledge_base_qa_knowledge_base.deleteMany({
			where: {
				knowledge_base_qa_id: String(id),
			},
		});

		await this.prisma.knowledge_base_qa.delete({
			where: {
				id: String(id),
			},
		});

		return true;
	}
}
