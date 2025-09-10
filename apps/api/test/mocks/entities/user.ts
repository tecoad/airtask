import { faker } from '@faker-js/faker';
import { user } from '@prisma/client';
import { LanguageCode } from 'src/graphql';

export const mockUser = (input?: Partial<user>): user => ({
	id: faker.datatype.number(),
	date_created: faker.date.past(),
	date_updated: faker.date.past(),
	email: faker.internet.email(),
	email_verification_token: null,
	email_verification_token_expiration: null,
	email_verified_at: null,
	first_name: faker.name.firstName(),
	last_name: faker.name.lastName(),
	last_login: null,
	password: faker.internet.password(),
	password_reset_token: null,
	anonymous_id: faker.datatype.uuid(),
	password_reset_token_expiration: null,
	language: LanguageCode.en,
	user_created: null,
	user_updated: null,
	permissions: [],
	...input,
});
