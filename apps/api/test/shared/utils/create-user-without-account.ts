import { faker } from '@faker-js/faker';
import { Prisma, user } from '@prisma/client';
import { TestEnvironment } from 'test/config/setup-test-environment';

export const createUserWithoutAccount = (
	environment: TestEnvironment,
	data?: {
		userInput?: Partial<Prisma.userCreateInput>;
	},
): Promise<user> => {
	const { userInput } = data ?? {};

	return environment.prisma.user.create({
		data: {
			first_name: 'John',
			last_name: 'Doe',
			email: faker.internet.email(),
			...userInput,
		},
	});
};
