import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ENV } from 'src/config/env';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
	public client = twilio(ENV.TWILIO.account_sid, ENV.TWILIO.auth_token);

	authCallback({ body, req, url }: { req: Request; body: any; url: string }) {
		const isAllowed = twilio.validateRequest(
			ENV.TWILIO.auth_token!,
			(req.headers['x-twilio-signature'] || req.headers['X-Twilio-Signature']) as string,
			url,
			body,
		);

		if (!isAllowed) throw new UnauthorizedException();
	}
}
