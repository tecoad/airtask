import { getQueueToken } from '@nestjs/bull';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AffiliatesService } from 'src/modules/affiliates/services/affiliates.service';
import { EmailService } from 'src/modules/common/services/email.service';
import { StripeService } from 'src/modules/common/services/stripe.service';
import { SubscriptionStatus } from 'src/shared/types/db';
import { mockStripe } from 'test/mocks/services/stripe';
import { STRIPE_QUEUE } from '../jobs/stripe.queue';
import { SubscriptionManagerService } from '../services/subscription-manager.service';
import { UsageManagerService } from '../services/usage-manager.service';
import { StripeExtraCreditsCheckoutMetaData } from '../types';
import { StripeCallbackController } from './stripe-callbacks.controller';

describe('StripeCallbacksController', () => {
	let module: TestingModule;
	let controller: StripeCallbackController;
	const stripeMocked = mockStripe();
	const usageManagerService = {
			setAccountResetUsageDate: jest.fn(),
			confirmExtraCreditPurchase: jest.fn(),
		},
		subscriptionManagerService = {
			changeSubscriptionStatusByStripeId: jest.fn(),
			provisionSubscription: jest.fn(),
			trackCancelSubscription: jest.fn(),
		};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	beforeAll(async () => {
		module = await Test.createTestingModule({
			controllers: [StripeCallbackController],
			providers: [
				{ provide: StripeService, useValue: stripeMocked },
				{ provide: UsageManagerService, useValue: usageManagerService },
				{
					provide: SubscriptionManagerService,
					useValue: subscriptionManagerService,
				},
				{ provide: EmailService, useValue: {} },
				{ provide: AffiliatesService, useValue: {} },
				{ provide: getQueueToken(STRIPE_QUEUE), useValue: { add: jest.fn() } },
			],
		}).compile();

		controller = module.get(StripeCallbackController);
	});

	afterAll(async () => {
		await module.close();
	});

	it('throws an error if the signature is invalid', async () => {
		const req = {
			headers: {
				'stripe-signature': 'invalid-signature',
			},
			rawBody: 'raw-body',
		};

		stripeMocked.webhooks.constructEvent.mockImplementationOnce(() => {
			throw new Error();
		});

		await expect(controller.handle(req as any)).rejects.toThrow(
			new UnauthorizedException().message,
		);
	});

	it('reset account usage date on customer.subscription.created', async () => {
		const req = {
			headers: {},
		};

		const event = {
			type: 'customer.subscription.created',
			data: {
				object: {
					metadata: {
						accountId: '1',
					},
				},
			},
		};

		stripeMocked.webhooks.constructEvent.mockReturnValueOnce(event);
		await controller.handle(req as any);

		expect(usageManagerService.setAccountResetUsageDate).toBeCalledWith(
			1,
			expect.any(Date),
		);
	});

	it.each([['invoice.paid']])('provision subscription on %s', async (eventType) => {
		const req = {
			headers: {},
		};

		const event = {
			type: eventType,
			data: {
				object: {
					subscription: '5',
					lines: {
						data: [
							{
								amount: 1,
							},
						],
					},
				},
			},
		};

		stripeMocked.webhooks.constructEvent.mockReturnValueOnce(event);
		await controller.handle(req as any);

		if (eventType === 'invoice.paid') {
			expect(subscriptionManagerService.provisionSubscription).toHaveBeenCalledWith('5');
		}
	});

	it('confirmExtraCreditPurchase on checkout.session.completed with a paymentLink and no subscription', async () => {
		const req = {
			headers: {},
		};

		const event = {
			type: 'checkout.session.completed',
			data: {
				object: {
					id: 'session-id',
					subscription: null,
					payment_link: {
						id: 'link-id',
					},
					metadata: {
						accountId: '29',
						kind: 'extra-credits-purchase',
					} as StripeExtraCreditsCheckoutMetaData,
				},
			},
		};

		stripeMocked.webhooks.constructEvent.mockReturnValueOnce(event);
		await controller.handle(req as any);

		expect(usageManagerService.confirmExtraCreditPurchase).toHaveBeenCalledWith(
			'session-id',
		);
	});

	it('cancel subscription on customer.subscription.deleted', async () => {
		const req = {
			headers: {},
		};

		const event = {
			type: 'customer.subscription.deleted',
			data: {
				object: {
					id: '32',
				},
			},
		};

		stripeMocked.webhooks.constructEvent.mockReturnValueOnce(event);
		await controller.handle(req as any);

		expect(
			subscriptionManagerService.changeSubscriptionStatusByStripeId,
		).toHaveBeenCalledWith('32', SubscriptionStatus.Cancelled);
	});

	it('set subscription as pending on invoice.payment_failed', async () => {
		const req = {
			headers: {},
		};

		const event = {
			type: 'invoice.payment_failed',
			data: {
				object: {
					subscription: '32',
				},
			},
		};

		stripeMocked.webhooks.constructEvent.mockReturnValueOnce(event);
		await controller.handle(req as any);

		expect(
			subscriptionManagerService.changeSubscriptionStatusByStripeId,
		).toHaveBeenCalledWith('32', SubscriptionStatus.Pending);
	});

	it('provision subscription on customer.subscription.updated', async () => {
		const req = {
			headers: {},
		};

		const event = {
			type: 'customer.subscription.updated',
			data: {
				object: {
					id: '51',
				},
				previous_attributes: {
					status: 'any',
				},
			},
		};

		stripeMocked.webhooks.constructEvent.mockReturnValueOnce(event);
		await controller.handle(req as any);

		expect(subscriptionManagerService.provisionSubscription).toHaveBeenCalledWith('51', {
			status: 'any',
		});
	});
});
