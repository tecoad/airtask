import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { affiliate, user } from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import { ENV } from 'src/config/env';
import { OnBoardingStepName, PlanInterval } from 'src/graphql';
import { v4 } from 'uuid';
import { PrismaService } from './prisma.service';

function handleTrackingError(method) {
	if (isAsyncFunction(method)) {
		// Is async, wrap into a new async function
		return async function (...args) {
			try {
				const result = await method.apply(this, args);
				return result;
			} catch (e) {
				console.log(e);
			}
		};
	} else {
		// Isn't async, wrap into a new sync function
		return function (...args) {
			try {
				const result = method.apply(this, args);
				return result;
			} catch (e) {
				console.log(e);
			}
		};
	}
}

function isAsyncFunction(fn) {
	return fn.constructor && fn.constructor.name === 'AsyncFunction';
}

@Injectable()
export class TrackingService {
	unsafe: this = {} as any;

	constructor(
		private readonly httpService: HttpService,
		private readonly prisma: PrismaService,
	) {
		// Each method will be wrapped at try/catch to prevent the execution
		// of the operations that use this class
		Object.getOwnPropertyNames(TrackingService.prototype).forEach((methodName) => {
			const method = this[methodName];
			if (typeof method === 'function') {
				this.unsafe[methodName] = method.bind(this);
				this[methodName] = handleTrackingError(method);
			}
		});
	}

	private async gtmEvent(eventName: string, variables: object, eventId = v4()) {
		await lastValueFrom(
			this.httpService.post(
				ENV.GTM.url!,
				{
					...variables,
					event_name: eventName,
					event_id: eventId,
					isProduction: ENV.isProd,
				},
				{
					headers: {
						...(ENV.GTM.use_server_preview
							? {
									['X-Gtm-Server-Preview']: ENV.GTM.server_preview,
							  }
							: {}),
					},
				},
			),
		);
	}

	private async gtmEventForAccount(
		eventName: string,
		accountId: number,
		extraVariables: object,
	) {
		const account = await this.prisma.account.findUniqueOrThrow({
			where: {
				id: accountId,
			},
			include: {
				account_user: {
					include: {
						user: true,
					},
				},
			},
		});

		const {
			id,
			name,
			description,
			segment,
			website,
			date_created,
			date_updated,
			date_reset_usage,
		} = account;

		await this.gtmEvent(eventName, {
			...extraVariables,
			account: {
				id,
				name,
				description,
				segment,
				website,
				date_created,
				date_updated,
				date_reset_usage,
				users: account.account_user
					.filter((item) => !!item.user)
					.map(({ user, role }) => {
						const {
							id,
							first_name,
							last_name,
							last_login,
							date_created,
							date_updated,
							email,
							email_verified_at,
						} = user!;

						return {
							id,
							role_in_account: role,
							first_name,
							last_name,
							last_login,
							date_created,
							date_updated,
							email,
							email_verified_at,
							is_email_verified: !!email_verified_at,
						};
					}),
			},
		});
	}

	private mapUserVariables(user: user) {
		return {
			user_data: {
				email_address: user.email,
				address: {
					first_name: user.first_name,
					last_name: user.last_name,
				},
			},
		};
	}

	subscriptionPaymentFailed(accountId: number) {
		this.gtmEventForAccount('subscription_payment_failed', accountId, {});
	}

	stepConcluded({
		accountId,
		stepName,
	}: {
		accountId: number;
		stepName: OnBoardingStepName;
	}) {
		this.gtmEventForAccount('step_completed', accountId, {
			stepName,
		});
	}

	subscriptionPurchase({
		plan_id,
		plan_name,
		plan_period,
		plan_price,
		plan_currency,
		anonymous_id,
		subscription_id,
		checkoutSessionId,
		user,
	}: {
		plan_id: number;
		plan_name: string;
		plan_period: PlanInterval;
		plan_price: number;
		plan_currency: string;

		anonymous_id: string;
		subscription_id: string;
		checkoutSessionId: string;
		user: user;
	}) {
		return this.gtmEvent(
			'subscribe',
			{
				plan_id,
				plan_name,
				plan_period,
				plan_price,
				plan_currency,
				checkout_id: checkoutSessionId,
				anonymous_id,
				subscription_id,
				...this.mapUserVariables(user),
			},
			checkoutSessionId,
		);
	}

	recurringSubscriptionPayment({
		currency,
		value,
		anonymous_id,
		subscription_id,
		user,
		plan_currency,
		plan_id,
		plan_name,
		plan_period,
		plan_price,
	}: {
		value: number;
		currency: string;
		anonymous_id: string;
		subscription_id: string;
		user: user;

		plan_id: number;
		plan_name: string;
		plan_period: PlanInterval;
		plan_price: number;
		plan_currency: string;
	}) {
		return this.gtmEvent('recurring_subscription_payment', {
			currency,
			value,
			anonymous_id,
			subscription_id,

			plan_id,
			plan_name,
			plan_period,
			plan_price,
			plan_currency,

			...this.mapUserVariables(user),
		});
	}

	cancelledSubscription({
		anonymous_id,
		subscription_id,
		user,
	}: {
		anonymous_id: string;
		subscription_id: string;
		user: user;
	}) {
		return this.gtmEvent('cancel_subscription', {
			anonymous_id,
			subscription_id,
			...this.mapUserVariables(user),
		});
	}

	affiliateSignUp(user: user, affiliate: affiliate) {
		return this.gtmEvent('refferer_signup', {
			alias: affiliate.alias,
			...this.mapUserVariables(user),
		});
	}

	affiliateComission({
		affiliate,
		commission_value,
		user,
	}: {
		user: user;
		affiliate: affiliate;
		commission_value: number;
	}) {
		return this.gtmEvent('referrer_commission', {
			alias: affiliate.alias,
			commission_value,
			...this.mapUserVariables(user),
		});
	}
}
