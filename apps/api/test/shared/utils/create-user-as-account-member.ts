import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';
import { AccountRole } from 'src/shared/types/db';
import { TestEnvironment } from 'test/config/setup-test-environment';
import { UserWithAccounts } from './create-user-as-account-owner';

export const createUserAsAccountMember = (
	environment: TestEnvironment,
	data?: {
		accountUserInput?: Prisma.account_userCreateInput;
		accountInput?: Prisma.accountCreateInput;
		accountConnectOrCreate?: Prisma.accountCreateOrConnectWithoutAccount_userInput;

		userInput?: Prisma.userCreateInput;
	},
): Promise<UserWithAccounts> => {
	const { accountUserInput, accountInput, userInput, accountConnectOrCreate } =
		data ?? {};

	return environment.prisma.user.create({
		data: {
			first_name: 'John',
			last_name: 'Doe',
			email: faker.internet.email(),
			...userInput,
			account_user: {
				create: [
					{
						...accountUserInput,
						account: {
							create: accountInput,
							...(accountConnectOrCreate
								? { connectOrCreate: accountConnectOrCreate }
								: {}),
						},
						role: AccountRole.User,
					},
				],
			},
		},
		include: {
			account_user: {
				include: {
					account: true,
				},
			},
		},
	});
};
