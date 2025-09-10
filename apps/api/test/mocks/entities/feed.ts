import { faker } from '@faker-js/faker';
import { feed } from '@prisma/client';
import { FeedFormat } from 'src/shared/types/db';

export const mockFeed = (input?: Partial<feed>): feed => ({
	id: faker.datatype.number(),
	date_created: faker.date.past(),
	date_updated: faker.date.past(),
	format: FeedFormat.Google,
	merchant: faker.datatype.number(),
	url: faker.internet.url(),
	user_created: null,
	user_updated: null,
	...input,
});
