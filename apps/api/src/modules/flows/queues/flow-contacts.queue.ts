import { LanguageCode } from '@airtask/emails/dist/translations';
import { Process, Processor } from '@nestjs/bull';
import { Prisma, flow_contact_import } from '@prisma/client';
import { Job } from 'bull';
import { readFileSync, unlinkSync, writeFileSync } from 'fs';
import { json2csv } from 'json-2-csv';
import * as path from 'path';
import { FlowContactStatus } from 'src/graphql';
import { EmailService } from 'src/modules/common/services/email.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import {
	FlowContactImportErroredItemsReport,
	FlowContactImportStatus,
} from 'src/shared/types/db';
import { isPhoneValid } from 'src/shared/utils/phone';
import { v4 } from 'uuid';
import z from 'zod';
import { ImportFlowContactCsvItem } from '../services/flows-contacts.service';

export const FLOW_CONTACTS_QUEUE = 'flow-contacts-queue';
export const IMPORT_FLOW_CONTACT_JOB = 'import-flow-contact-job';

export type ImportFlowContactJobData = {
	item: ImportFlowContactCsvItem;
	itemIndex: number;
	importId: flow_contact_import['id'];
};

export type FlowContactsQueueData = ImportFlowContactJobData;

@Processor(FLOW_CONTACTS_QUEUE)
export class FlowContactsQueue {
	constructor(
		private readonly prisma: PrismaService,
		private readonly emailService: EmailService,
	) {}

	importFlowContactInputSchema = z.object({
		email: z.string().email().nullable(),
		phone: z.string().refine(isPhoneValid),
		first_name: z.string().nonempty(),
		last_name: z.string().nonempty(),
	});

	@Process(IMPORT_FLOW_CONTACT_JOB)
	async importFlowContactJob(job: Job<ImportFlowContactJobData>) {
		const { importId, item, itemIndex } = job.data;

		let transactionSuccess = false;
		while (!transactionSuccess) {
			try {
				const { updatedFlowContactImport } = await this.prisma.$transaction(
					async (trx) => {
						const importEntity = await trx.flow_contact_import.findUniqueOrThrow({
								where: {
									id: importId,
								},
								include: {
									segment_flow_contact_import_segmentTosegment: true,
								},
							}),
							importSegment = importEntity.segment_flow_contact_import_segmentTosegment;

						let errors: z.ZodIssue[] = [];

						try {
							const valid = this.importFlowContactInputSchema.parse(item);

							const existent = await this.prisma.flow_contact.findFirst({
								where: {
									account: importEntity.account,
									phone: valid.phone,
								},
								include: {
									flow_contact_flow_contact_segment: true,
								},
							});

							if (existent) {
								// This contact is in the import segment?
								const existentIsInImportSegment =
									existent.flow_contact_flow_contact_segment.find(
										(item) => item.flow_contact_segment_id === importSegment.id,
									);

								await this.prisma.flow_contact.update({
									where: { id: existent.id },
									data: {
										...valid,
										// If not, create M2M relation
										...(existentIsInImportSegment
											? {}
											: {
													flow_contact_flow_contact_segment: {
														create: {
															flow_contact_segment_id: importEntity.segment,
														},
													},
											  }),
									},
								});
							} else {
								await trx.flow_contact.create({
									data: {
										id: v4(),
										status: FlowContactStatus.active,
										account: importEntity.account,
										flow_contact_flow_contact_segment: {
											create: {
												flow_contact_segment_id: importEntity.segment,
											},
										},

										...valid,
									},
								});
							}
						} catch (e) {
							const data: z.ZodError = e;

							errors = data.errors;
						}

						const updated = await trx.flow_contact_import.update({
							where: {
								id: importId,
							},
							data: {
								completed_items: {
									increment: 1,
								},
								...(errors.length
									? {
											errored_items_report: [
												...(importEntity.errored_items_report as []),
												<FlowContactImportErroredItemsReport>{
													rowNumber: itemIndex,
													errors: errors.map((v) => ({
														field: v.path[0] as string,
														message: v.message,
													})),
												},
											],
									  }
									: []),
							},
						});

						return { updatedFlowContactImport: updated };
					},
					{
						isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
					},
				);

				transactionSuccess = true;

				await job.progress(75);

				if (
					updatedFlowContactImport.completed_items ===
					updatedFlowContactImport.total_items
				) {
					const user = await this.prisma.user.findUnique({
						where: {
							id: updatedFlowContactImport.user,
						},
					});

					await this.prisma.flow_contact_import.update({
						where: {
							id: importId,
						},
						data: {
							status: FlowContactImportStatus.Completed,
						},
					});

					if (user) {
						const failedItems = (
							updatedFlowContactImport.errored_items_report as FlowContactImportErroredItemsReport[]
						).length;

						const csvErrorFile =
							failedItems && this.erroredItemsReportToCsvBase64(updatedFlowContactImport);

						await this.emailService.importFlowContactsResult(
							user.email,
							{
								languageCode: user.language as LanguageCode,
								totalItems: updatedFlowContactImport.total_items,
								successItems: updatedFlowContactImport.total_items - failedItems,
								failedItems,
							},
							{
								...(csvErrorFile
									? {
											attachments: [
												{
													name: csvErrorFile.name,
													content: csvErrorFile.base64,
													contentType: 'text/csv',
												},
											],
									  }
									: {}),
							},
						);
					}
				}

				await job.progress(100);

				break;
			} catch (error) {
				if (error.code === 'P2034') {
					continue;
				}

				console.log(error);
				break;
			}
		}
	}

	erroredItemsReportToCsvBase64(flowContactImport: flow_contact_import) {
		const rows = (
			flowContactImport.errored_items_report as FlowContactImportErroredItemsReport[]
		).map((v) => ({
			line: v.rowNumber,
			error: v.errors.map((v) => v.field).join(' - '),
		}));

		const csvContent = json2csv(rows);

		const name = `Import ${flowContactImport.date_created?.toDateString()} ${flowContactImport.date_created?.toLocaleTimeString()}.csv`;
		const tempFilePath = path.join(
			process.cwd(),
			'temp',
			(v4() + name).replaceAll(' ', '-'),
		);
		writeFileSync(tempFilePath, csvContent);

		const base64 = readFileSync(tempFilePath, 'base64');
		unlinkSync(tempFilePath);

		return { name, base64 };
	}
}
