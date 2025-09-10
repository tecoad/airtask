import { UnauthorizedException } from '@nestjs/common';

export type BasicAuthData = {
	username: string;
	password: string;
};

export const parseBasicAuth = (auth: string) => {
	try {
		if (!auth || typeof auth !== 'string') {
			throw new Error('No or wrong argument');
		}

		const parts = auth.split(' ');

		const result: Partial<{
			scheme: string;
			username: string;
			password: string;
		}> = {};

		result.scheme = parts[0];
		if (result.scheme !== 'Basic') {
			return result;
		}

		const decoded = Buffer.from(parts[1], 'base64').toString('utf8');
		const colon = decoded.indexOf(':');

		result.username = decoded.substr(0, colon);
		result.password = decoded.substr(colon + 1);

		return result;
	} catch (e) {
		console.log(e);
		throw new UnauthorizedException();
	}
};
