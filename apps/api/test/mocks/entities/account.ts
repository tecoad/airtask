import { faker } from '@faker-js/faker';
import { account, segment, subscription, subscription_plan } from '@prisma/client';
import { SubscriptionStatus } from 'src/shared/types/db';

export const mockAccount = (input?: Partial<account>): account => ({
	api_key: faker.datatype.uuid(),
	date_created: faker.date.past(),
	website: faker.internet.url(),
	widget_config: null,
	date_updated: faker.date.past(),
	description: faker.lorem.sentence(),
	id: faker.datatype.number(),
	name: faker.company.name(),
	payment_external_id: faker.datatype.uuid(),
	segment: null,
	date_reset_usage: faker.date.past(),
	referrer: null,
	currency: faker.finance.currencyCode(),
	...input,
});

export const mockSubscription = (input?: Partial<subscription>): subscription => ({
	account: faker.datatype.number(),
	date_created: faker.date.past(),
	date_updated: faker.date.past(),
	id: faker.datatype.number(),
	status: SubscriptionStatus.Active,
	subscription_plan: faker.datatype.number(),
	user_created: null,
	user_updated: null,
	recurring_interval: 'month',
	plan_price: null,
	...input,
});

export const mockSubscriptionPlan = (
	input?: Partial<subscription_plan>,
): subscription_plan => ({
	allowed_modules: ['quotation'],
	quotation_model_name: faker.internet.domainName(),
	benefits: '',
	is_active: true,
	date_created: faker.date.past(),
	date_updated: faker.date.past(),
	external_id: faker.datatype.uuid(),
	id: faker.datatype.number(),
	name: faker.commerce.productName(),
	user_created: null,
	user_updated: null,
	...input,
});

export const mockSegment = (input?: Partial<segment>): segment => ({
	id: faker.datatype.number(),
	date_created: faker.date.past(),
	date_updated: faker.date.past(),
	title: faker.lorem.sentence(),
	translations: [],
	...input,
});
