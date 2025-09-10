import { Injectable } from '@nestjs/common';
import { ValidationError } from 'apollo-server-express';
import {
	CreateFlowContactSegmentInput,
	UpdateFlowContactSegmentInput,
} from 'src/graphql';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { ID } from 'src/shared/types/db';
import { v4 } from 'uuid';

@Injectable()
export class FlowsContactsSegmentsService {
	constructor(private readonly prisma: PrismaService) {}

	create(input: CreateFlowContactSegmentInput) {
		const { account, ...data } = input;
		return this.prisma.flow_contact_segment.create({
			data: {
				id: v4(),
				account: Number(account),
				...data,
			},
		});
	}

	update(input: UpdateFlowContactSegmentInput) {
		const { id, ...data } = input;

		if (data.label === null) throw new ValidationError('Label is a mandatory field');

		return this.prisma.flow_contact_segment.update({
			where: { id: String(id) },
			data: {
				...data,
				label: data.label,
			},
		});
	}

	async softDelete(id: ID) {
		await this.prisma.flow_contact_flow_contact_segment.deleteMany({
			where: {
				flow_contact_segment_id: String(id),
			},
		});

		const flowInstances = await this.prisma.flow.count({
			where: {
				date_deleted: null,
				segment: String(id),
			},
		});

		if (flowInstances > 0) {
			throw new ValidationError('This segment is being used by a flow');
		}

		return this.prisma.flow_contact_segment.update({
			where: { id: String(id) },
			data: {
				date_deleted: new Date(),
			},
		});
	}

	find(id: ID) {
		return this.prisma.flow_contact_segment.findUnique({
			where: { id: String(id), date_deleted: null },
		});
	}

	listForAccount(accountId: ID) {
		return this.prisma.flow_contact_segment.findMany({
			where: {
				account: Number(accountId),
				date_deleted: null,
			},
		});
	}
}
