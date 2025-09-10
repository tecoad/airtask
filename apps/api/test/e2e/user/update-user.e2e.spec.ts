import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { user } from '@prisma/client';
import { HasherSerice } from 'src/modules/common/services/hasher.service';
import { sanitizeEmail, sanitizeName } from 'src/modules/users/utils/sanitize';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { LOGIN_USER, UPDATE_USER } from 'test/shared/gql/private/user';
import {
	ActiveUserFragment,
	LanguageCode,
	LoginUserMutation,
	LoginUserMutationVariables,
	UpdateUserInput,
	UpdateUserMutation,
	UpdateUserMutationVariables,
	UserAuthError,
	UserAuthErrorCode,
} from 'test/shared/test-gql-private-api-schema.ts';

jest.setTimeout(15000);

describe('Update User', () => {
	let environment: TestEnvironment;
	let user: user;
	const userInput = {
		email: 'update-user@gmail.com',
		first_name: 'test-first-name',
		last_name: 'test-last-name',
		password: 'old-password',
	};

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		const create = async () => {
			const hasher = environment.app.get(HasherSerice);
			const hashed = await hasher.hash(userInput.password);

			user = await environment.prisma.user.create({
				data: {
					...userInput,
					password: hashed,
					email_verified_at: new Date(),
				},
			});

			await environment.prisma.user.create({
				data: {
					...userInput,
					email: 'second-user@gmail.com',
				},
			});
		};

		try {
			await create();
		} catch {
			try {
				await environment.prisma.user.delete({
					where: { email: userInput.email },
				});
				await environment.prisma.user.delete({
					where: { email: 'second-user@gmail.com' },
				});
			} catch {
				/** */
			}

			await create();
		}
	});

	afterAll(async () => {
		try {
			await environment.prisma.user.delete({
				where: {
					email: userInput.email,
				},
			});
		} catch {
			/** */
		}

		await environment.close();
	});

	it('throw error trying to update user without being logged in', async () => {
		await expect(
			environment.privateApiClient.query<UpdateUserMutation, UpdateUserMutationVariables>(
				UPDATE_USER,
				{
					input: {},
				},
			),
		).rejects.toThrowError(new UnauthorizedException().message);

		// auth for next suits
		environment.privateApiClient.authenticateAsUser(user.id, user.email);
	});

	it('throw error trying to update user with existent new email', async () => {
		const { data } = await environment.privateApiClient.query<
			UpdateUserMutation,
			UpdateUserMutationVariables
		>(UPDATE_USER, {
			input: {
				email: 'second-user@gmail.com',
			},
		});

		expect(data.updateUser).toEqual(<UserAuthError>{
			errorCode: UserAuthErrorCode.EmailAlreadyExists,
			message: expect.any(String),
		});
	});

	it('doesnt throw error trying to update user with existent old email', async () => {
		const { data } = await environment.privateApiClient.query<
			UpdateUserMutation,
			UpdateUserMutationVariables
		>(UPDATE_USER, {
			input: {
				email: userInput.email,
			},
		});

		expect(data.updateUser).toMatchObject(<ActiveUserFragment>{
			id: user.id.toString(),
		});
	});

	it('throw error trying to update user without old password', async () => {
		const { data } = await environment.privateApiClient.query<
			UpdateUserMutation,
			UpdateUserMutationVariables
		>(UPDATE_USER, {
			input: {
				password: 'new-password',
			},
		});

		expect(data.updateUser).toEqual(<UserAuthError>{
			errorCode: UserAuthErrorCode.InvalidCredentials,
			message: expect.any(String),
		});

		// Old password keep valid
		const { data: lgnData } = await environment.privateApiClient.query<
			LoginUserMutation,
			LoginUserMutationVariables
		>(LOGIN_USER, {
			input: {
				email: user.email,
				password: userInput.password,
			},
		});
		expect(lgnData.loginUser).toMatchObject(<ActiveUserFragment>{
			id: user.id.toString(),
		});
	});

	it('throw error trying to update user with invalid old password', async () => {
		const { data } = await environment.privateApiClient.query<
			UpdateUserMutation,
			UpdateUserMutationVariables
		>(UPDATE_USER, {
			input: {
				old_password: userInput.password + '-invalid',
				password: 'new-password',
			},
		});

		expect(data.updateUser).toEqual(<UserAuthError>{
			errorCode: UserAuthErrorCode.InvalidCredentials,
			message: expect.any(String),
		});

		// Old password keep valid
		const { data: lgnData } = await environment.privateApiClient.query<
			LoginUserMutation,
			LoginUserMutationVariables
		>(LOGIN_USER, {
			input: {
				email: user.email,
				password: userInput.password,
			},
		});
		expect(lgnData.loginUser).toMatchObject(<ActiveUserFragment>{
			id: user.id.toString(),
		});
	});

	const input: UpdateUserInput = {
		old_password: userInput.password,
		password: 'new-password',
		email: faker.internet.email(),
		first_name: faker.name.firstName() + 'NoTSANItized',
		last_name: faker.name.lastName() + 'NoTSANItized',
		language: LanguageCode.En,
	};
	it('update user', async () => {
		const { data } = await environment.privateApiClient.query<
			UpdateUserMutation,
			UpdateUserMutationVariables
		>(UPDATE_USER, {
			input,
		});

		expect(data.updateUser).toEqual(<ActiveUserFragment>{
			id: user.id.toString(),
			email: sanitizeEmail(input.email!),
			first_name: sanitizeName(input.first_name!),
			last_name: sanitizeName(input.last_name!),
			language: input.language,
		});

		// New password now is valid
		const { data: lgnData } = await environment.privateApiClient.query<
			LoginUserMutation,
			LoginUserMutationVariables
		>(LOGIN_USER, {
			input: {
				email: input.email!,
				password: 'new-password',
			},
		});
		expect(lgnData.loginUser).toMatchObject(<ActiveUserFragment>{
			id: user.id.toString(),
		});
	});

	it.each([[''], ['  '], [null]])('cant nullify password', async (value) => {
		const { data } = await environment.privateApiClient.query<
			UpdateUserMutation,
			UpdateUserMutationVariables
		>(UPDATE_USER, {
			input: {
				old_password: 'new-password',
				password: value,
			},
		});

		expect(data.updateUser).toMatchObject(<ActiveUserFragment>{
			id: user.id.toString(),
		});

		const { data: lgnData } = await environment.privateApiClient.query<
			LoginUserMutation,
			LoginUserMutationVariables
		>(LOGIN_USER, {
			input: {
				email: input.email!,
				password: 'new-password',
			},
		});

		expect(lgnData.loginUser).toMatchObject(<ActiveUserFragment>{
			id: user.id.toString(),
		});
	});

	it.each([[''], ['  '], [null]])(
		'cant nullify first_name, last_name and email',
		async (value) => {
			const { data } = await environment.privateApiClient.query<
				UpdateUserMutation,
				UpdateUserMutationVariables
			>(UPDATE_USER, {
				input: {
					email: value,
					first_name: value,
					last_name: value,
				},
			});

			expect(data.updateUser).toMatchObject(<ActiveUserFragment>{
				email: sanitizeEmail(input.email!),
				first_name: sanitizeName(input.first_name!),
				last_name: sanitizeName(input.last_name!),
			});
		},
	);
});
