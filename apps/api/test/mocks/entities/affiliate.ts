import { faker } from '@faker-js/faker';
import { Prisma, affiliate, affiliate_comission } from '@prisma/client';

export const mockAffiliate = (input?: Partial<affiliate>): affiliate => ({
	id: faker.datatype.number(),
	alias: faker.internet.userName(),
	comission_duration_months: 12,
	comission_percentage: 20,
	date_created: faker.date.past(),
	date_updated: faker.date.past(),
	payout_method: 'paypal',
	payout_method_key: faker.internet.userName(),
	status: 'active',
	user: 0,
	...input,
});

export const mockAffiliateComission = (
	input?: Partial<affiliate_comission>,
): affiliate_comission => ({
	amount: new Prisma.Decimal(0),
	account: 0,
	affiliate: 0,
	currency: faker.finance.currencyCode(),
	date_created: faker.date.past(),
	date_updated: faker.date.past(),
	date_payment: faker.date.past(),
	id: faker.datatype.number(),
	status: 'pending',
	...input,
});
