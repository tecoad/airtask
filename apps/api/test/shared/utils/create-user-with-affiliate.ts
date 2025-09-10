import { faker } from '@faker-js/faker';
import { Prisma, affiliate, user } from '@prisma/client';
import { TestEnvironment } from 'test/config/setup-test-environment';
import { v4 } from 'uuid';

export type UserWithAffiliate = user & {
	affiliate_affiliate_userTouser: affiliate | null;
};

export const createUserWithAffiliate = (
	environment: TestEnvironment,
	data?: {
		userInput?: Prisma.userCreateInput;
	},
): Promise<UserWithAffiliate> => {
	const { userInput } = data ?? {};

	return environment.prisma.user.create({
		data: {
			first_name: 'John',
			last_name: 'Doe',
			email: faker.internet.email(),
			affiliate_affiliate_userTouser: {
				create: {
					alias: v4(),
					date_created: new Date(),
				},
			},
			...userInput,
		},
		include: {
			affiliate_affiliate_userTouser: true,
		},
	});
};
