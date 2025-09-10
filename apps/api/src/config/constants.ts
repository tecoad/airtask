import { add, Duration } from 'date-fns';
import { CookieOptions } from 'express';
import * as path from 'path';
import { ENV } from './env';

export const CONSTANTS = Object.seal({
	USERS: Object.seal({
		cookie_name: 'session',
		jwt_expires: '1y',
		COOKIE_OPTIONS: Object.seal(<CookieOptions>{
			expires: add(new Date(), { years: 1 }),
			httpOnly: true,
			secure: true,
			sameSite: 'none',
			domain: ENV.COOKIES.domain,
		}),
		email_verification_token_expiration: <Duration>{
			hours: 3,
		},
		password_reset_token_expiration: <Duration>{
			hours: 2,
		},
	}),
	FILES: Object.seal({
		tempFolderPath: path.join(process.cwd(), 'temp'),
	}),
	AFFILIATES: Object.seal({
		default_comission_percentage: 20,
		default_comission_duration_months: 12,
	}),
	ASSETS_FOLDERS: Object.seal({
		flow_call_recording: 'FlowCallRecording',
	}),
	STRIPE: Object.seal({
		metadatas: {
			kind: 'kind',
			currency: 'currency',
		},
	}),
});

export enum StripeMetadataKind {
	ExtraCredits = 'extra_credits',
}
