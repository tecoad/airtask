import { Prisma } from '@prisma/client';
import { ENV } from 'src/config/env';
import { makeSureStringNotEndsWithSlash } from './url';

export const resolveAssetName = (id: string) => {
	return `${makeSureStringNotEndsWithSlash(ENV.DIRECTUS.url!)}/assets/${id}`;
};

export const resolveEntityViewUrl = (
	collection: Prisma.ModelName,
	unique: string | number,
) => {
	return `${makeSureStringNotEndsWithSlash(
		ENV.DIRECTUS.url!,
	)}/admin/content/${collection}/${unique}`;
};
