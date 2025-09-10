import { faker } from '@faker-js/faker';
import { affiliate } from '@prisma/client';
import { sanitizeEmail } from 'src/modules/users/utils/sanitize';
import { AffiliateStatus } from 'src/shared/types/db';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { REGISTER_USER } from 'test/shared/gql/private/user';
import {
	RegisterUserMutation,
	RegisterUserMutationVariables,
} from 'test/shared/test-gql-private-api-schema.ts';
import { v4 } from 'uuid';

jest.setTimeout(15000);

describe('User Authentication', () => {
	let environment: TestEnvironment;
	const user = {
		email: faker.internet.email(),
		first_name: 'Test-first-name',
		last_name: 'Test-last-name',
	};
	let affiliate: affiliate;

	beforeEach(() => {
		user.email = faker.internet.email();
	});

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		try {
			affiliate = await environment.prisma.affiliate.create({
				data: {
					status: AffiliateStatus.Inactive,
					alias: v4(),
				},
			});
		} catch (e) {
			console.log(e);
			/** */
		}
	});

	afterAll(async () => {
		await environment.close();
	});

	it('registers a user with invalid affiliate', async () => {
		const { data } = await environment.privateApiClient.query<
			RegisterUserMutation,
			RegisterUserMutationVariables
		>(REGISTER_USER, {
			input: {
				...user,
				password: 'test-password',
				referrer: affiliate.alias + 'invalid',
			},
		});

		expect(data.registerUser).toEqual(<RegisterUserMutation['registerUser']>{
			created_id: expect.any(String),
			should_verify_email: true,
		});

		const userAtDb = await environment.prisma.user.findUniqueOrThrow({
			where: {
				email: sanitizeEmail(user.email),
			},
			include: {
				account_user: {
					include: {
						account: true,
					},
				},
			},
		});

		const accountCreated = userAtDb.account_user[0].account;
		expect(accountCreated!.referrer).toBeNull();
	});

	it('register with inactive affiliate', async () => {
		const { data } = await environment.privateApiClient.query<
			RegisterUserMutation,
			RegisterUserMutationVariables
		>(REGISTER_USER, {
			input: {
				...user,
				password: 'test-password',
				referrer: affiliate.alias,
			},
		});

		expect(data.registerUser).toEqual(<RegisterUserMutation['registerUser']>{
			created_id: expect.any(String),
			should_verify_email: true,
		});

		const userAtDb = await environment.prisma.user.findUniqueOrThrow({
			where: {
				email: sanitizeEmail(user.email),
			},
			include: {
				account_user: {
					include: {
						account: true,
					},
				},
			},
		});

		const accountCreated = userAtDb.account_user[0].account;
		expect(accountCreated!.referrer).toBeNull();
	});

	it('register with active affiliate', async () => {
		await environment.prisma.affiliate.update({
			data: {
				status: AffiliateStatus.Active,
			},
			where: {
				id: affiliate.id,
			},
		});

		const { data } = await environment.privateApiClient.query<
			RegisterUserMutation,
			RegisterUserMutationVariables
		>(REGISTER_USER, {
			input: {
				...user,
				password: 'test-password',
				referrer: affiliate.alias,
			},
		});
		expect(data.registerUser).toEqual(<RegisterUserMutation['registerUser']>{
			created_id: expect.any(String),
			should_verify_email: true,
		});

		const userAtDb = await environment.prisma.user.findUniqueOrThrow({
			where: {
				email: sanitizeEmail(user.email),
			},
			include: {
				account_user: {
					include: {
						account: true,
					},
				},
			},
		});

		const accountCreated = userAtDb.account_user[0].account;
		expect(accountCreated!.referrer).toBe(affiliate.id);
	});
});
