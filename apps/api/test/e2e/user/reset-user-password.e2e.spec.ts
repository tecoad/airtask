import { user } from '@prisma/client';
import { LanguageCode } from 'src/graphql';
import { EmailService } from 'src/modules/common/services/email.service';
import { HasherSerice } from 'src/modules/common/services/hasher.service';
import {
	setupTestEnvironment,
	TestEnvironment,
} from 'test/config/setup-test-environment';
import {
	LOGIN_USER,
	REQUEST_USER_PASSWORD_RESET,
	RESET_USER_PASSWORD,
} from 'test/shared/gql/private/user';
import {
	LoginUserMutation,
	LoginUserMutationVariables,
	RequestUserPasswordResetMutation,
	RequestUserPasswordResetMutationVariables,
	ResetUserPasswordError,
	ResetUserPasswordErrorCode,
	ResetUserPasswordMutation,
	ResetUserPasswordMutationVariables,
	User,
	UserAuthErrorCode,
} from 'test/shared/test-gql-private-api-schema.ts';

jest.setTimeout(15000);

const sendResetPasswordMock = jest
	.spyOn(EmailService.prototype, 'sendPasswordReset')
	.mockImplementation(() => Promise.resolve());

describe('Reset User Password', () => {
	let environment: TestEnvironment;
	let user: user;
	const userInput = {
		email: 'lost-password-email@gmail.com',
		first_name: 'test-first-name',
		last_name: 'test-last-name',
		password: 'forgot-password',
	};

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		const create = async () => {
			const hasher = environment.app.get(HasherSerice);
			const hashed = await hasher.hash(userInput.password);

			user = await environment.prisma.user.create({
				data: {
					...userInput,
					language: LanguageCode.en,
					password: hashed,
					email_verified_at: new Date(),
				},
			});
		};

		try {
			await create();
		} catch {
			await environment.prisma.user.delete({
				where: { email: userInput.email },
			});

			await create();
		}
	});

	afterAll(async () => {
		await environment.prisma.user.delete({
			where: {
				email: userInput.email,
			},
		});

		await environment.close();
	});

	let sendedToken: string;

	it('request user password reset', async () => {
		const response = await environment.privateApiClient.query<
			RequestUserPasswordResetMutation,
			RequestUserPasswordResetMutationVariables
		>(REQUEST_USER_PASSWORD_RESET, {
			email: userInput.email,
		});

		expect(response.data.requestUserPasswordReset).toBe(true);
		expect(sendResetPasswordMock).toHaveBeenCalledWith(userInput.email, {
			token: expect.any(String),
			action_link: expect.any(String),
			languageCode: LanguageCode.en,
		});

		sendedToken = sendResetPasswordMock.mock.calls[0][1].token;
	});

	const newPassword = 'new-password';

	it('new password dont works before change', async () => {
		const { data } = await environment.privateApiClient.query<
			LoginUserMutation,
			LoginUserMutationVariables
		>(LOGIN_USER, {
			input: {
				email: user.email,
				password: newPassword,
			},
		});

		expect(data.loginUser).toEqual(<LoginUserMutation['loginUser']>{
			errorCode: UserAuthErrorCode.InvalidCredentials,
			message: expect.any(String),
		});
	});

	it('throws trying to use a wrong token', async () => {
		const result = await environment.privateApiClient.query<
			ResetUserPasswordMutation,
			ResetUserPasswordMutationVariables
		>(RESET_USER_PASSWORD, {
			input: {
				token: `${sendedToken}-wrong`,
				password: 'new-password',
			},
		});

		expect(result.data.resetUserPassword).toEqual(<ResetUserPasswordError>{
			errorCode: ResetUserPasswordErrorCode.InvalidToken,
			message: expect.any(String),
		});
	});

	let correctExpirationTokenDate: Date;

	it('throws trying to use a expired token', async () => {
		// Here we update the expiration date to now and store the correctly that was set,
		// to test the expiration date error
		const user = await environment.prisma.user.findUniqueOrThrow({
			where: {
				email: userInput.email,
			},
		});
		correctExpirationTokenDate = user.password_reset_token_expiration!;
		await environment.prisma.user.update({
			where: { email: userInput.email },
			data: { password_reset_token_expiration: new Date() },
		});

		const result = await environment.privateApiClient.query<
			ResetUserPasswordMutation,
			ResetUserPasswordMutationVariables
		>(RESET_USER_PASSWORD, {
			input: {
				token: sendedToken,
				password: newPassword,
			},
		});

		expect(result.data.resetUserPassword).toEqual(<ResetUserPasswordError>{
			errorCode: ResetUserPasswordErrorCode.ExpiredToken,
			message: expect.any(String),
		});
	});

	it('resets user password', async () => {
		// Update the token expiration date to the correct one again
		await environment.prisma.user.update({
			where: { email: userInput.email },
			data: { password_reset_token_expiration: correctExpirationTokenDate },
		});

		const result = await environment.privateApiClient.query<
			ResetUserPasswordMutation,
			ResetUserPasswordMutationVariables
		>(RESET_USER_PASSWORD, {
			input: {
				token: sendedToken,
				password: newPassword,
			},
		});

		expect(result.data.resetUserPassword).toEqual(
			expect.objectContaining(<User>{
				email: userInput.email,
			}),
		);
	});

	it('new password works after change', async () => {
		const { data } = await environment.privateApiClient.query<
			LoginUserMutation,
			LoginUserMutationVariables
		>(LOGIN_USER, {
			input: {
				email: user.email,
				password: newPassword,
			},
		});

		expect(data.loginUser).toEqual(
			expect.objectContaining(<LoginUserMutation['loginUser']>{
				email: userInput.email,
			}),
		);
	});
});
