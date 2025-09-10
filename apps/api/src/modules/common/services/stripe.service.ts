import { Injectable } from '@nestjs/common';
import { ENV } from 'src/config/env';
import Stripe from 'stripe';

@Injectable()
export class StripeService extends Stripe {
	constructor() {
		super(ENV.STRIPE.api_key!, {
			apiVersion: '2022-11-15',
		});
	}
}
