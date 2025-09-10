import { Prisma, segment } from '@prisma/client';
import { LanguageCode } from 'src/graphql';
import { SegmentTranslationAtDb } from 'src/modules/accounts/types';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { AVAILABLE_SEGMENTS } from 'test/shared/gql/private/quotation';
import {
	AvailableSegmentsQuery,
	AvailableSegmentsQueryVariables,
} from 'test/shared/test-gql-private-api-schema.ts';

jest.setTimeout(15000);

describe('Query Available Segments', () => {
	let environment: TestEnvironment;
	const segments: Pick<segment, 'title' | 'translations'>[] = [
		{
			title: 'TheSegment01',
			translations: [
				{
					language: LanguageCode.en,
					translation: 'TheSegment01-en',
				},
				{
					language: LanguageCode.pt,
					translation: 'TheSegment01-pt',
				},
			] as SegmentTranslationAtDb,
		},
		{
			title: 'TheSegment02',
			translations: [
				{
					language: LanguageCode.en,
					translation: 'TheSegment02-en',
				},
				{
					language: LanguageCode.pt,
					translation: 'TheSegment02-pt',
				},
			] as SegmentTranslationAtDb,
		},
	];
	const segmentsIds: number[] = [];

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		for (const data of segments) {
			const exists = await environment.prisma.segment.findFirst({
				where: {
					title: data.title,
				},
			});

			if (exists) {
				const { id } = await environment.prisma.segment.update({
					where: {
						id: exists.id,
					},
					data: {
						title: data.title,
						translations: data.translations as Prisma.JsonArray,
					},
				});

				segmentsIds.push(id);
			} else {
				const { id } = await environment.prisma.segment.create({
					data: {
						title: data.title,
						translations: data.translations as Prisma.JsonArray,
					},
				});

				segmentsIds.push(id);
			}
		}
	});

	afterAll(async () => {
		await environment.prisma.segment.deleteMany({
			where: {
				id: {
					in: segmentsIds,
				},
			},
		});

		await environment.close();
	});

	it('find available segments', async () => {
		const { data } = await environment.privateApiClient.query<
			AvailableSegmentsQuery,
			AvailableSegmentsQueryVariables
		>(AVAILABLE_SEGMENTS);

		expect(data.availableSegments).toEqual(
			expect.arrayContaining([
				{
					title: 'TheSegment01',
					translations: expect.arrayContaining([
						{
							language: LanguageCode.en,
							value: 'TheSegment01-en',
						},
						{
							language: LanguageCode.pt,
							value: 'TheSegment01-pt',
						},
					]),
				},
				{
					title: 'TheSegment02',
					translations: expect.arrayContaining([
						{
							language: LanguageCode.en,
							value: 'TheSegment02-en',
						},
						{
							language: LanguageCode.pt,
							value: 'TheSegment02-pt',
						},
					]),
				},
			] as AvailableSegmentsQuery['availableSegments']),
		);
	});
});
