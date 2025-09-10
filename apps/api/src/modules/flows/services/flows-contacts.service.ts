import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Prisma, flow_contact } from '@prisma/client';
import { ValidationError } from 'apollo-server-express';
import { Queue } from 'bull';
import * as csv from 'csvtojson';
import {
	BatchUpdateFlowContact,
	ImportFlowContactsErrorCode,
	ImportFlowContactsFromCsvInput,
	ImportFlowContactsFromCsvResult,
	ToggleFlowContactInSegmentInput,
	ToggleFlowContactInSegmentMode,
} from 'src/graphql';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { UserJwtPayload } from 'src/modules/users/types';
import { EntityNotFoundError } from 'src/shared/errors';
import { FlowContactImportStatus, ID } from 'src/shared/types/db';
import { Readable } from 'stream';
import { v4 } from 'uuid';
import {
	FLOW_CONTACTS_QUEUE,
	FlowContactsQueueData,
	IMPORT_FLOW_CONTACT_JOB,
} from '../queues/flow-contacts.queue';

const standardColumns = ['email', 'first_name', 'last_name', 'phone'] as const;
type StandardColums = (typeof standardColumns)[number];

export type ImportFlowContactCsvItem = Record<StandardColums, string>;

@Injectable()
export class FlowsContactsService {
	constructor(
		private readonly prisma: PrismaService,
		@InjectQueue(FLOW_CONTACTS_QUEUE)
		private readonly flowContactsQueue: Queue<FlowContactsQueueData>,
	) {}

	async importManyFromCsv(
		user: UserJwtPayload,
		input: ImportFlowContactsFromCsvInput,
		file: Readable,
	): Promise<ImportFlowContactsFromCsvResult> {
		const segment = await this.prisma.flow_contact_segment.findUnique({
			where: {
				id: input.segment,
			},
		});

		if (!segment || segment.account !== Number(input.account))
			throw new EntityNotFoundError('flow_contact_segment', input.segment);

		let items: any[];

		try {
			items = await csv().fromStream(file);
		} catch {
			return {
				errorCode: ImportFlowContactsErrorCode.INVALID_FILE_FORMAT,
				message: 'Error trying to decode csv',
			};
		}

		if (!items.length) {
			return {
				errorCode: ImportFlowContactsErrorCode.NO_ITEMS_FOUND,
				message: 'Not items found on csv',
			};
		}

		const columns = Object.keys(items[0]);

		const columnsMissing: StandardColums[] = [];

		for (const columnName of standardColumns) {
			if (!columns.includes(columnName)) {
				columnsMissing.push(columnName);
			}
		}

		if (columnsMissing.length) {
			return {
				errorCode: ImportFlowContactsErrorCode.INVALID_CSV_COLUMNS_STRUCTURE,
				message: columnsMissing.join(','),
			};
		}

		const importEntity = await this.prisma.flow_contact_import.create({
			data: {
				id: v4(),
				total_items: items.length,
				completed_items: 0,
				status: FlowContactImportStatus.InProgress,
				errored_items_report: [],
				segment: input.segment,
				account: Number(input.account),
				user: user.id,
			},
		});

		this.flowContactsQueue.addBulk(
			items.map((v, k) => ({
				data: {
					importId: importEntity.id,
					item: v,
					// match CSV row line number
					itemIndex: k + 2,
				},
				name: IMPORT_FLOW_CONTACT_JOB,
				opts: {
					attempts: 3,
				},
			})),
		);

		return { queued_items: items.length, import_id: importEntity.id };
	}

	update(data: BatchUpdateFlowContact) {
		if (data.status === null) throw new ValidationError('Status is a mandatory field');

		return this.prisma.flow_contact.update({
			where: {
				id: String(data.id),
			},
			data: {
				...data,
				status: data.status,
			},
		});
	}

	async toggleContactsOnSegment(input: ToggleFlowContactInSegmentInput) {
		if (input.mode === ToggleFlowContactInSegmentMode.ADD) {
			await this.prisma.flow_contact_flow_contact_segment.createMany({
				data: input.contactId.map<Prisma.flow_contact_flow_contact_segmentCreateManyInput>(
					(contactId) => ({
						flow_contact_id: contactId,
						flow_contact_segment_id: input.segmentId,
					}),
				),
			});
		} else if (input.mode === ToggleFlowContactInSegmentMode.REMOVE) {
			await this.prisma.flow_contact_flow_contact_segment.deleteMany({
				where: {
					flow_contact_id: {
						in: input.contactId,
					},
					flow_contact_segment_id: input.segmentId,
				},
			});
		}

		const contacts = await this.prisma.flow_contact.findMany({
			where: {
				id: {
					in: input.contactId,
				},
			},
		});

		// Why not just return contacts?
		// Because the order of the contacts might be important to the client,
		// so we need to return the contacts in the same order as the input
		const result: flow_contact[] = [];
		const contactById = contacts.reduce(
			(acc, item) => {
				acc[item.id] = item;
				return acc;
			},
			{} as Record<string, flow_contact>,
		);
		for (const contactId of input.contactId) {
			const item = contactById[contactId];
			result.push(item);
		}

		return result;
	}

	find(id: ID) {
		return this.prisma.flow_contact.findUnique({
			where: {
				id: String(id),
				date_deleted: null,
			},
		});
	}

	listAll(accountId: ID, args: Prisma.flow_contactFindManyArgs) {
		return this.prisma.flow_contact.findMany({
			...args,
			where: {
				...args.where,
				account: Number(accountId),
				date_deleted: null,
			},
		});
	}

	count(accountId: ID, args: Prisma.flow_contactFindManyArgs['where']) {
		return this.prisma.flow_contact.count({
			where: {
				...args,
				account: Number(accountId),
				date_deleted: null,
			},
		});
	}

	softDelete(id: ID) {
		return this.prisma.flow_contact.update({
			where: {
				id: String(id),
			},
			data: {
				date_deleted: new Date(),
			},
		});
	}
}
