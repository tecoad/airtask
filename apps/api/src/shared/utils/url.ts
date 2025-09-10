export const makeSureStringEndsWithSlash = (url: string) =>
	url.endsWith('/') ? url : `${url}/`;

export const makeSureStringNotEndsWithSlash = (url: string) =>
	url.endsWith('/') ? url.slice(0, -1) : url;

export const makeSureStringStartsWithSlash = (url: string) =>
	url.startsWith('/') ? url : `/${url}`;

export const makeSureStringNotStartsWithSlash = (url: string) =>
	url.startsWith('/') ? url.slice(1) : url;
