import { Directus } from '@directus/sdk';
import { Injectable } from '@nestjs/common';
import { ENV } from 'src/config/env';

@Injectable()
export class DirectusSdk extends Directus<Record<string, never>> {
	constructor() {
		super(ENV.DIRECTUS.url!, {
			auth: {
				staticToken: ENV.DIRECTUS.staticToken,
			},
		});
	}
}
