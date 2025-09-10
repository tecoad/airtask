import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { StripeService } from 'src/modules/common/services/stripe.service';
import { SystemNotificationsService } from 'src/modules/common/services/system-notifications.service';
import { TrackingService } from 'src/modules/common/services/tracking.service';
import { AccountRole, SubscriptionStatus } from 'src/shared/types/db';
import {
	mockAccount,
	mockSubscription,
	mockSubscriptionPlan,
} from 'test/mocks/entities/account';
import { mockUser } from 'test/mocks/entities/user';
import { mockPrisma } from 'test/mocks/prisma';
import { mockStripe } from 'test/mocks/services/stripe';
import { StripeSubscriptionMetaData } from '../types';
import { CreditsManagerService } from './credits-manager.service';
import { SubscriptionManagerService } from './subscription-manager.service';
import { UsageManagerService } from './usage-manager.service';

describe('SubscriptionManagerService', () => {
	let module: TestingModule;
	let service: SubscriptionManagerService;
	const prismaMocked = mockPrisma();
	const stripeMocked = mockStripe();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	beforeAll(async () => {
		module = await Test.createTestingModule({
			providers: [
				SubscriptionManagerService,
				{ provide: PrismaService, useValue: prismaMocked },
				{ provide: StripeService, useValue: stripeMocked },
				{
					provide: SystemNotificationsService,
					useValue: {
						newSubscription: jest.fn(),
						subscriptionCancelled: jest.fn(),
					},
				},
				{ provide: CreditsManagerService, useValue: {} },
				{ provide: UsageManagerService, useValue: {} },
				{ provide: TrackingService, useValue: {} },
			],
		}).compile();

		service = module.get(SubscriptionManagerService);
	});

	afterAll(async () => {
		await module.close();
	});

	describe('provisionSubscription', () => {
		it('create subscription if doesnt exists', async () => {
			stripeMocked.subscriptions.retrieve.mockResolvedValueOnce({
				id: 'stripe-subscription-id',
				status: 'trialing',
				metadata: <StripeSubscriptionMetaData>{
					accountId: '37',
				},
				items: {
					data: [
						{
							price: {
								product: 'stripe-price-product-id',
								recurring: {
									interval: 'month',
								},
							},
						},
					],
				},
				customer: 'customer-id',
			});

			const account = mockAccount({ id: 37 }),
				subscriptionPlan = mockSubscriptionPlan();

			prismaMocked.account.findUniqueOrThrow.mockResolvedValueOnce({
				...account,
				account_user: [
					{
						role: AccountRole.Owner,
						user: mockUser(),
					},
				],
			});
			prismaMocked.subscription.findFirst.mockResolvedValueOnce(null);
			prismaMocked.subscription_plan.findFirstOrThrow.mockResolvedValueOnce(
				subscriptionPlan,
			);

			await service.provisionSubscription('stripe-subscription-id');

			// Get correctly account
			expect(prismaMocked.account.findUniqueOrThrow).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						id: 37,
					},
				}),
			);
			// Get correctly subscription
			expect(stripeMocked.subscriptions.retrieve).toHaveBeenCalledWith(
				'stripe-subscription-id',
			);
			// Get correctly subscription plan
			expect(prismaMocked.subscription_plan.findFirstOrThrow).toHaveBeenCalledWith({
				where: {
					external_id: 'stripe-price-product-id',
				},
			});
			// Correctly update subscription
			expect(prismaMocked.subscription.create).toHaveBeenCalledWith({
				data: {
					account: 37,
					status: SubscriptionStatus.Trialing,
					subscription_plan: subscriptionPlan.id,
					recurring_interval: 'month',
				},
			});
		});

		it('sets subscription as active and update subscriptionPlan if is active at stripe', async () => {
			stripeMocked.subscriptions.retrieve.mockResolvedValueOnce({
				id: 'stripe-subscription-id',
				status: 'active',
				metadata: <StripeSubscriptionMetaData>{
					accountId: '37',
				},
				items: {
					data: [
						{
							price: {
								product: 'stripe-price-product-id',
								recurring: {
									interval: 'year',
								},
							},
						},
					],
				},
				customer: 'customer-id',
			});

			const account = mockAccount({ id: 37 }),
				subscription = mockSubscription(),
				subscriptionPlan = mockSubscriptionPlan();

			prismaMocked.account.findUniqueOrThrow.mockResolvedValueOnce({
				...account,
				account_user: [{ role: AccountRole.Owner, user: mockUser() }],
			});
			prismaMocked.subscription.findFirst.mockResolvedValueOnce(subscription);
			prismaMocked.subscription_plan.findFirstOrThrow.mockResolvedValueOnce(
				subscriptionPlan,
			);

			await service.provisionSubscription('stripe-subscription-id');

			// Get correctly account
			expect(prismaMocked.account.findUniqueOrThrow).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						id: 37,
					},
				}),
			);
			// Get correctly subscription
			expect(stripeMocked.subscriptions.retrieve).toHaveBeenCalledWith(
				'stripe-subscription-id',
			);
			// Get correctly subscription plan
			expect(prismaMocked.subscription_plan.findFirstOrThrow).toHaveBeenCalledWith({
				where: {
					external_id: 'stripe-price-product-id',
				},
			});
			// Correctly update subscription
			expect(prismaMocked.subscription.update).toHaveBeenCalledWith({
				where: {
					id: subscription.id,
				},
				data: {
					account: 37,
					status: SubscriptionStatus.Active,
					subscription_plan: subscriptionPlan.id,
					recurring_interval: 'year',
				},
			});
		});

		it('sets subscription as paused if is not active at stripe', async () => {
			stripeMocked.subscriptions.retrieve.mockResolvedValueOnce({
				id: 'stripe-subscription-id',
				status: 'unpaid',
				metadata: <StripeSubscriptionMetaData>{
					accountId: '37',
				},
				items: {
					data: [
						{
							price: {
								product: 'stripe-price-product-id',
							},
						},
					],
				},
				customer: 'customer-id',
			});

			const account = mockAccount({ id: 37 }),
				subscription = mockSubscription({ id: 2 });

			prismaMocked.account.findUniqueOrThrow.mockResolvedValueOnce(account);
			prismaMocked.subscription.findFirst.mockResolvedValueOnce(subscription);

			await service.provisionSubscription('stripe-subscription-id');

			// Get correctly account
			expect(prismaMocked.account.findUniqueOrThrow).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						id: 37,
					},
				}),
			);
			// Get correctly subscription
			expect(stripeMocked.subscriptions.retrieve).toHaveBeenCalledWith(
				'stripe-subscription-id',
			);
			// Correctly update subscription
			expect(prismaMocked.subscription.update).toHaveBeenCalledWith({
				where: {
					id: 2,
				},
				data: {
					status: SubscriptionStatus.Cancelled,
				},
			});
		});
	});

	describe('changeSubscriptionStatusByStripeId', () => {
		it('changes a subscription status by stripe id', async () => {
			stripeMocked.subscriptions.retrieve.mockResolvedValueOnce({
				id: 'stripe-subscription-id',
				metadata: <StripeSubscriptionMetaData>{
					accountId: '37',
				},
				items: {
					data: [
						{
							price: {
								id: 'stripe-price-id',
							},
						},
					],
				},
			});

			const account = {
					...mockAccount(),
					account_user: [
						{
							user: mockUser(),
						},
					],
				},
				subscription = mockSubscription();

			prismaMocked.account.findUniqueOrThrow.mockResolvedValueOnce(account);
			prismaMocked.subscription.findFirstOrThrow.mockResolvedValueOnce(subscription);

			await service.changeSubscriptionStatusByStripeId(
				'stripe-subscription-id',
				SubscriptionStatus.Cancelled,
			);

			// Get correctly account
			expect(prismaMocked.account.findUniqueOrThrow).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						id: 37,
					},
				}),
			);
			// Get correctly subscription
			expect(stripeMocked.subscriptions.retrieve).toHaveBeenCalledWith(
				'stripe-subscription-id',
			);
			// Correctly update subscription
			expect(prismaMocked.subscription.update).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						id: subscription.id,
					},
					data: {
						status: SubscriptionStatus.Cancelled,
					},
				}),
			);
		});
	});
});
