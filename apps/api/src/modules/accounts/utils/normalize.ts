import { segment } from '@prisma/client';
import { LanguageCode, Segment } from 'src/graphql';
import { SegmentTranslationAtDb } from '../types';

export const dbSegmentToGqlSegment = (segment: segment): Segment => ({
	...segment,
	id: segment.id.toString(),
	translations:
		(segment.translations as SegmentTranslationAtDb | null)?.map((v) => ({
			language: v.language as LanguageCode,
			value: v.translation,
		})) || [],
});
