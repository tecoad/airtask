import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';
import { AccountRole } from 'src/shared/types/db';
import { TestEnvironment } from 'test/config/setup-test-environment';
import { createAccountWithSubscription } from './create-account-with-subscription';
import { UserWithAccounts } from './create-user-as-account-owner';

export const createUserAsAccountMemberWithSubscription = async (
	environment: TestEnvironment,
	data?: {
		accountUserInput?: Prisma.account_userCreateInput;
		accountInput?: Prisma.accountCreateInput;
		userInput?: Partial<Prisma.userCreateInput>;
		subscriptionInput: Partial<Prisma.subscriptionCreateInput>;
		subscriptionPlanInput: Prisma.subscription_planCreateInput;
	},
): Promise<UserWithAccounts> => {
	const {
		accountUserInput,
		accountInput,
		userInput,
		subscriptionInput,
		subscriptionPlanInput,
	} = data ?? {};

	const { account } = await createAccountWithSubscription(environment, {
		accountInput,
		subscriptionInput,
		subscriptionPlanInput,
	});

	return environment.prisma.user.create({
		data: {
			first_name: 'John',
			last_name: 'Doe',
			email: faker.internet.email(),
			...userInput,
			account_user: {
				create: [
					{
						account: {
							connect: {
								id: account.id,
							},
						},
						role: AccountRole.User,
						...accountUserInput,
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
