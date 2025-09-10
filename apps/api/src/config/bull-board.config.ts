import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { INestApplication } from '@nestjs/common';
import { Queue } from 'bullmq';
import * as basicAuth from 'express-basic-auth';
import { getForTestingRedis } from 'src/app.module';
import { ONBOARDING_STEPS_QUEUE } from 'src/modules/accounts/jobs/constants';
import { EMAIL_QUEUE } from 'src/modules/common/jobs/email.queue';
import { DISCORD_INTERACTIONS_QUEUE } from 'src/modules/discord/queues/discord-interaction.queue';
import { FLOW_CONTACTS_QUEUE } from 'src/modules/flows/queues/flow-contacts.queue';
import { FLOW_CAMPAIGN_INTERACTIONS_QUEUE } from 'src/modules/flows/queues/flow-interaction.queue';
import { FLOW_INTERACTION_RECORD_QUEUE } from 'src/modules/flows/queues/interaction-recording.queue';
import { METRICS_QUEUE } from 'src/modules/metrics/queues/constants';
import { QUOTATIONS_QUEUE } from 'src/modules/quotations/jobs/constants';
import { USAGE_CONTROL_QUEUE } from 'src/modules/subscriptions/jobs/constants';
import { STRIPE_QUEUE } from 'src/modules/subscriptions/jobs/stripe.queue';
import { ENV } from './env';
import { redisConfig } from './redis.config';

export const setupBullBoard = async (app: INestApplication) => {
	const serverAdapter = new ExpressAdapter();
	serverAdapter.setBasePath('/admin/queues');

	const queues = [
		USAGE_CONTROL_QUEUE,
		QUOTATIONS_QUEUE,
		ONBOARDING_STEPS_QUEUE,
		EMAIL_QUEUE,
		DISCORD_INTERACTIONS_QUEUE,
		METRICS_QUEUE,

		FLOW_CONTACTS_QUEUE,
		FLOW_INTERACTION_RECORD_QUEUE,
		FLOW_CAMPAIGN_INTERACTIONS_QUEUE,

		STRIPE_QUEUE,
	];

	const localInstance = ENV.BULL_BOARD.force_local_queue_instance
		? await (async () => {
				const forTestingRedis = getForTestingRedis();
				return {
					host: await forTestingRedis.getHost(),
					port: await forTestingRedis.getPort(),
				};
		  })()
		: null;

	createBullBoard({
		queues: queues.map(
			(v) =>
				new BullMQAdapter(
					new Queue(v, {
						connection: localInstance || redisConfig,
					}),
				),
		),
		options: {
			uiConfig: {
				boardTitle: 'Queues AirTask',
				favIcon: {
					alternative: 'https://app.airtask.dev/favicon.ico',
					default: 'https://app.airtask.dev/favicon.ico',
				},
			},
		},
		serverAdapter,
	});

	app.use(
		'/admin/queues',
		basicAuth({
			users: {
				[ENV.BULL_BOARD.user!]: ENV.BULL_BOARD.password!,
			},
			challenge: true,
		}),
		serverAdapter.getRouter(),
	);
};
