import { faker } from '@faker-js/faker';
import { merchant, Prisma } from '@prisma/client';
import { FeedSyncPeriod, MerchantStatus } from 'src/shared/types/db';
import { v4 } from 'uuid';

export const mockMerchant = (input?: Partial<merchant>): merchant => ({
	id: faker.datatype.number(),
	date_created: faker.date.past(),
	date_updated: faker.date.past(),
	feeds_sync_period: FeedSyncPeriod.Daily,
	key: v4(),
	spend_limit: new Prisma.Decimal(0),
	status: MerchantStatus.Active,
	user_created: null,
	user_updated: null,
	name: faker.company.name(),
	customer_responsible: null,
	external_customer_id: null,
	...input,
});
