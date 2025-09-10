import { faker } from '@faker-js/faker';
import { quotation, quotation_question, segment, user } from '@prisma/client';
import { QuotationStatus } from 'src/shared/types/db';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { QUOTATION_MODEL_BY_SEGMENT } from 'test/shared/gql/private/quotation';
import {
	QuotationModelBySegmentQuery,
	QuotationModelBySegmentQueryVariables,
} from 'test/shared/test-gql-private-api-schema.ts';
import { v4 } from 'uuid';

jest.setTimeout(15000);

describe('Quotation Model by Segment', () => {
	let user: user,
		environment: TestEnvironment,
		segment: segment,
		quotation: quotation & {
			quotation_question_quotation_question_quotationToquotation: quotation_question[];
		};

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		user = await environment.prisma.user.create({
			data: {
				first_name: 'John',
				last_name: 'Doe',
				email: faker.internet.email(),
			},
		});

		const question01Id = v4();

		// Create the model quotation
		quotation = await environment.prisma.quotation.create({
			data: {
				id: v4(),
				hash: v4(),
				status: QuotationStatus.Published,
				title: 'test-title',
				prompt_instructions: 'test-prompt-instructions',
				quotation_question_quotation_question_quotationToquotation: {
					create: [
						{
							id: question01Id,
							label: 'Question 1',
							active: true,
						},
						{
							id: v4(),
							label: 'Question 1.1',
							active: true,
							parent: question01Id,
						},
					],
				},
			},
			include: {
				quotation_question_quotation_question_quotationToquotation: true,
			},
		});

		// Delete all segments with the same title
		await environment.prisma.segment.deleteMany({
			where: {
				title: 'Segment 1',
			},
		});

		// Create the segment
		segment = await environment.prisma.segment.create({
			data: {
				title: 'Segment 1',
				quotation_models_quotation_models_segmentTosegment: {
					create: {
						quotation: quotation.id,
					},
				},
			},
		});

		environment.privateApiClient.authenticateAsUser(user.id, user.email);
	});

	afterAll(async () => {
		await environment.close();
	});

	it('find quotation model by segment', async () => {
		const { data } = await environment.privateApiClient.query<
			QuotationModelBySegmentQuery,
			QuotationModelBySegmentQueryVariables
		>(QUOTATION_MODEL_BY_SEGMENT, {
			segmentId: segment.id,
		});

		data.quotationModelBySegment?.questions!.sort((a) => {
			// Without parent should come first
			return a.parent ? 1 : -1;
		});

		expect(data.quotationModelBySegment).toEqual(
			expect.objectContaining({
				id: quotation.id.toString(),
				title: quotation.title,
				hash: quotation.hash,
				questions: [
					expect.objectContaining({
						id: quotation.quotation_question_quotation_question_quotationToquotation[0]
							.id,
					}),
					expect.objectContaining({
						id: quotation.quotation_question_quotation_question_quotationToquotation[1]
							.id,
					}),
				],
			}),
		);
	});
});
