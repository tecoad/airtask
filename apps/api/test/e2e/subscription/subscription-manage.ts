// import { account, account_credit, subscription, subscription_plan } from '@prisma/client';
// import { AxiosError } from 'axios';
// import { add, isSameDay, sub } from 'date-fns';
// import { ENV } from 'src/config/env';
// import { SubscriptionStatus } from 'src/graphql';
// import { AccountsService } from 'src/modules/accounts/services/accounts.service';
// import { StripeService } from 'src/modules/common/services/stripe.service';
// import { CreditsManagerService } from 'src/modules/subscriptions/services/credits-manager.service';
// import {
// 	TestEnvironment,
// 	setupTestEnvironment,
// } from 'test/config/setup-test-environment';
// import {
// 	UserWithAccounts,
// 	createUserAsAccountOwner,
// } from 'test/shared/utils/create-user-as-account-owner';
// import { stripeCallbacksForCreateSubscription } from './data/create-stripe-subscription-callbacks';
// import { downgradeStripeSubscriptionPlanCallbacks } from './data/downgrade-stripe-subscription-plan-callbacks';

// // StripeService.prototype.webhooks.constructEvent = jest.fn((payload) =>
// // 	payload instanceof Uint8Array
// // 		? JSON.parse(new TextDecoder('utf8').decode(payload))
// // 		: JSON.parse(payload),
// // );

// describe('Subscription Manage', () => {
// 	let environment: TestEnvironment,
// 		user: UserWithAccounts,
// 		account: account,
// 		accountsService: AccountsService,
// 		stripeService: StripeService,
// 		creditsService: CreditsManagerService;

// 	let desiredPlan: subscription_plan, desiredDowngradePlan: subscription_plan;

// 	const validRequestToStripe = (payload: object) => {
// 		const signature = stripeService.webhooks.generateTestHeaderString({
// 			payload: JSON.stringify(payload, null, 2),
// 			secret: ENV.STRIPE.webhook_secret!,
// 		});

// 		return environment.httpClient.post('/callback/stripe', payload, {
// 			headers: {
// 				'stripe-signature': signature,
// 				'Content-Type': 'application/json',
// 			},
// 		});
// 	};

// 	beforeAll(async () => {
// 		environment = await setupTestEnvironment();
// 		stripeService = environment.app.get(StripeService);
// 		creditsService = environment.app.get(CreditsManagerService);

// 		user = await createUserAsAccountOwner(environment, {
// 			accountInput: {
// 				name: 'Test Account',
// 			},
// 		});
// 		account = user.account_user[0].account!;

// 		accountsService = environment.app.get(AccountsService);

// 		const { customerSubscriptionCreatedPayload: onCreateUpdateEvent } =
// 			stripeCallbacksForCreateSubscription({
// 				accountId: account.id.toString(),
// 			});

// 		desiredPlan = await environment.prisma.subscription_plan.findFirstOrThrow({
// 			where: {
// 				external_id: onCreateUpdateEvent.data.object.plan.product,
// 			},
// 		});

// 		const { customerSubscriptionUpdatedPayload: onDowngradeUpdateEvent } =
// 			downgradeStripeSubscriptionPlanCallbacks({
// 				accountId: account.id.toString(),
// 			});

// 		desiredDowngradePlan = await environment.prisma.subscription_plan.findFirstOrThrow({
// 			where: {
// 				external_id: onDowngradeUpdateEvent.data.object.plan.product,
// 			},
// 		});
// 	});

// 	afterAll(async () => {
// 		await environment.close();
// 	});

// 	it('should not have a subscription', async () => {
// 		const { plan, subscription } = await accountsService.findSubscriptionPlan(account);

// 		expect(plan).toBeNull();
// 		expect(subscription).toBeNull();

// 		const { customerSubscriptionCreatedPayload } = stripeCallbacksForCreateSubscription({
// 			accountId: account.id.toString(),
// 		});

// 		await stripeService.subscriptions.update(
// 			customerSubscriptionCreatedPayload.data.object.id,
// 			{
// 				metadata: customerSubscriptionCreatedPayload.data.object.metadata,
// 			},
// 		);
// 	});

// 	it('stripe controller throws an error when the signature is invalid', async () => {
// 		const { customerSubscriptionCreatedPayload } = stripeCallbacksForCreateSubscription({
// 			accountId: account.id.toString(),
// 		});

// 		await expect(
// 			environment.httpClient.post(
// 				'/callback/stripe',
// 				customerSubscriptionCreatedPayload,
// 				{
// 					headers: {
// 						'stripe-signature': 'invalid-signature',
// 					},
// 				},
// 			),
// 		).rejects.toThrowError(new AxiosError(undefined, '401').message);
// 	});

// 	it('create a subscription', async () => {
// 		const {
// 			checkoutSubscriptionSessionCompletedPayload,
// 			customerSubscriptionCreatedPayload,
// 			customerSubscriptionUpdatedPayload,
// 			subscriptionInvoicePaidPayload,
// 		} = stripeCallbacksForCreateSubscription({
// 			accountId: account.id.toString(),
// 		});

// 		await validRequestToStripe(customerSubscriptionCreatedPayload);
// 		await validRequestToStripe(customerSubscriptionUpdatedPayload);
// 		await validRequestToStripe(subscriptionInvoicePaidPayload);
// 		await validRequestToStripe(checkoutSubscriptionSessionCompletedPayload);

// 		const { plan, subscription } = await accountsService.findSubscriptionPlan(account.id);

// 		expect(plan).toEqual(desiredPlan);
// 		expect(subscription).toEqual(
// 			expect.objectContaining(<subscription>{
// 				id: expect.any(Number),
// 				account: account.id,
// 				date_created: expect.any(Date),
// 				date_updated: expect.any(Date),
// 				recurring_interval: 'month',
// 				status: SubscriptionStatus.active,
// 				subscription_plan: desiredPlan.id,
// 				user_created: null,
// 				user_updated: null,
// 			}),
// 		);

// 		const accountNow = await accountsService.find(account.id);

// 		expect(
// 			isSameDay(
// 				add(new Date(), {
// 					months: 1,
// 				}),
// 				accountNow!.date_reset_usage as Date,
// 			),
// 		).toBe(true);

// 		// Has credit for the subscription plan
// 		const { balance, credits } = await creditsService.totalBalanceForAccount(account.id);

// 		expect(balance).toEqual(desiredPlan.monthly_given_balance);

// 		expect(credits).toEqual([
// 			<account_credit>{
// 				id: expect.any(String),
// 				account: account.id,
// 				amount: desiredPlan.monthly_given_balance,
// 				balance: desiredPlan.monthly_given_balance,
// 				date_created: expect.any(Date),
// 				date_updated: null,
// 				is_given_by_plan: true,
// 			},
// 		]);
// 	});

// 	it('downgrade subscription plan', async () => {
// 		// First, we update the account reset usage to be in the past, so we can test if it is updated
// 		await environment.prisma.account.update({
// 			where: {
// 				id: account.id,
// 			},
// 			data: {
// 				date_reset_usage: sub(new Date(), {
// 					months: 1,
// 				}),
// 			},
// 		});

// 		const { customerSubscriptionUpdatedPayload, invoicePaidPayload } =
// 			downgradeStripeSubscriptionPlanCallbacks({
// 				accountId: account.id.toString(),
// 			});

// 		const stripeSubscription = await stripeService.subscriptions.retrieve(
// 				customerSubscriptionUpdatedPayload.data.object.id,
// 			),
// 			stripeSubscriptionPrice = stripeSubscription.items.data[0];

// 		await stripeService.subscriptionItems.update(stripeSubscriptionPrice.id, {
// 			plan: customerSubscriptionUpdatedPayload.data.object.plan.id,
// 		});

// 		await validRequestToStripe(customerSubscriptionUpdatedPayload);
// 		await validRequestToStripe(invoicePaidPayload);

// 		console.log('ESPECIAL', new Date().toTimeString());

// 		const { plan, subscription } = await accountsService.findSubscriptionPlan(account.id);

// 		expect(plan).toEqual(desiredDowngradePlan);
// 		expect(subscription).toEqual(
// 			expect.objectContaining(<subscription>{
// 				id: expect.any(Number),
// 				account: account.id,
// 				date_created: expect.any(Date),
// 				date_updated: expect.any(Date),
// 				recurring_interval: 'month',
// 				status: SubscriptionStatus.active,
// 				subscription_plan: desiredDowngradePlan.id,
// 				user_created: null,
// 				user_updated: null,
// 			}),
// 		);

// 		const accountNow = await accountsService.find(account.id);

// 		expect(
// 			isSameDay(
// 				add(new Date(), {
// 					months: 1,
// 				}),
// 				accountNow!.date_reset_usage as Date,
// 			),
// 		).toBe(true);

// 		const { balance, credits } = await creditsService.totalBalanceForAccount(account.id);

// 		expect(balance).toEqual(desiredPlan.monthly_given_balance);

// 		expect(credits).toEqual([
// 			<account_credit>{
// 				id: expect.any(String),
// 				account: account.id,
// 				// Because it is a downgrade, the amount should be the same as the previous plan
// 				amount: desiredPlan.monthly_given_balance,
// 				balance: desiredPlan.monthly_given_balance,
// 				date_created: expect.any(Date),
// 				date_updated: null,
// 				is_given_by_plan: true,
// 			},
// 		]);
// 	});
// });
