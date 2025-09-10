import { InjectQueue } from '@nestjs/bull';
import {
	Controller,
	Post,
	RawBodyRequest,
	Req,
	UnauthorizedException,
} from '@nestjs/common';
import { Queue } from 'bull';
import { Request } from 'express';
import { ENV } from 'src/config/env';
import { StripeService } from 'src/modules/common/services/stripe.service';
import Stripe from 'stripe';
import { STRIPE_PROCESS_CALLBACK_JOB, STRIPE_QUEUE } from '../jobs/stripe.queue';

@Controller('callback/stripe')
export class StripeCallbackController {
	constructor(
		@InjectQueue(STRIPE_QUEUE)
		private readonly stripeQueue: Queue<Stripe.Event>,
		private readonly stripe: StripeService,
	) {}

	@Post()
	async handle(@Req() req: RawBodyRequest<Request>) {
		const signature = req.headers['stripe-signature'];
		let event: Stripe.Event;

		try {
			event = this.stripe.webhooks.constructEvent(
				req.rawBody || JSON.stringify(req.body, null, 2),
				signature!,
				ENV.STRIPE.webhook_secret!,
			);
		} catch (e) {
			throw new UnauthorizedException();
		}

		await this.stripeQueue.add(STRIPE_PROCESS_CALLBACK_JOB, event, {
			jobId: event.id,
		});

		return { status: 'success' };
	}
}
