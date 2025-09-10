import { Injectable } from '@nestjs/common';
import { flow_agent } from '@prisma/client';
import { ValidationError } from 'apollo-server-express';
import { CreateFlowAgentInput, UpdateFlowAgentInput } from 'src/graphql';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { ID } from 'src/shared/types/db';
import { v4 } from 'uuid';

@Injectable()
export class FlowsAgentsService {
	constructor(private readonly prisma: PrismaService) {}

	async create(input: CreateFlowAgentInput) {
		const { account, ...data } = input;

		if (data.knowledge_base) {
			const knowledBaseItem = await this.prisma.knowledge_base.findUnique({
				where: {
					id: data.knowledge_base,
				},
			});

			if (knowledBaseItem && Number(account) !== knowledBaseItem.account) {
				throw new Error('knowledBase-must-be-from-the-same-account');
			}
		}

		return this.prisma.flow_agent.create({
			data: {
				id: v4(),
				account: Number(account),
				...data,
			},
		});
	}

	async update(input: UpdateFlowAgentInput, agent: flow_agent) {
		const { id, ...data } = input;

		if (data.voice === null || data.editor_type === null || data.title === null)
			throw new ValidationError('voice, editor_type and title are mandatory fields');

		if (input.knowledge_base) {
			const knowledBaseItem = await this.prisma.knowledge_base.findUnique({
				where: {
					id: input.knowledge_base,
				},
			});

			if (knowledBaseItem && agent.account !== knowledBaseItem.account) {
				throw new Error('knowledBase-must-be-from-the-same-account');
			}
		}

		return this.prisma.flow_agent.update({
			where: { id: String(id) },
			data: {
				...data,
				voice: data.voice,
				editor_type: data.editor_type,
				title: data.title,
			},
		});
	}

	softDelete(id: ID) {
		return this.prisma.flow_agent.update({
			where: { id: String(id) },
			data: {
				date_deleted: new Date(),
			},
		});
	}

	find(id: ID) {
		return this.prisma.flow_agent.findUnique({
			where: { id: String(id), date_deleted: null },
		});
	}

	listForAccount(accountId: ID) {
		return this.prisma.flow_agent.findMany({
			where: {
				account: Number(accountId),
				date_deleted: null,
			},
		});
	}
}
