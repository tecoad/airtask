import { faker } from '@faker-js/faker';
import { account, account_user, Prisma, user } from '@prisma/client';
import { AccountRole } from 'src/shared/types/db';
import { TestEnvironment } from 'test/config/setup-test-environment';

export type UserWithAccounts = user & {
	account_user: (account_user & {
		account: account | null;
	})[];
};

export const createUserAsAccountOwner = (
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
						role: AccountRole.Owner,
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
