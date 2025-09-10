import { makeSureStringStartsWithSlash } from 'src/shared/utils/url';

export const prefix = (path?: string) =>
	'v1' + (path ? makeSureStringStartsWithSlash(path) : '');
