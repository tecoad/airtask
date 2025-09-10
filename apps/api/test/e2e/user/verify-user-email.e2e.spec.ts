import { CONSTANTS } from 'src/config/constants';
import { LanguageCode } from 'src/graphql';
import { EmailService } from 'src/modules/common/services/email.service';
import {
	setupTestEnvironment,
	TestEnvironment,
} from 'test/config/setup-test-environment';
import {
	REQUEST_USER_EMAIL_VERIFICATION,
	VERIFY_USER_EMAIL,
} from 'test/shared/gql/private/user';
import {
	RequestUserEmailVerificationMutation,
	RequestUserEmailVerificationMutationVariables,
	User,
	VerifyUserEmailError,
	VerifyUserEmailErrorCode,
	VerifyUserEmailMutation,
	VerifyUserEmailMutationVariables,
} from 'test/shared/test-gql-private-api-schema.ts';

jest.setTimeout(30000);

const sendVerificationEmailMock = jest
	.spyOn(EmailService.prototype, 'sendVerificationEmail')
	.mockImplementation(() => Promise.resolve());

describe('Verify User Email', () => {
	let environment: TestEnvironment;
	const userInput = {
		email: 'unverified-email@gmail.com',
		first_name: 'test-first-name',
		last_name: 'test-last-name',
		language: LanguageCode.en,
	};
	let user: User;

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		try {
			user = await environment.prisma.user.create({
				data: userInput,
			});
		} catch (e) {
			await environment.prisma.user.delete({ where: { email: userInput.email } });
			user = await environment.prisma.user.create({
				data: userInput,
			});
			/**
			 *
			 */
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

	let sendedToken: string, sendedUserId: string;

	it('request user email verification', async () => {
		const response = await environment.privateApiClient.query<
			RequestUserEmailVerificationMutation,
			RequestUserEmailVerificationMutationVariables
		>(REQUEST_USER_EMAIL_VERIFICATION, {
			requestUserEmailVerificationId: user.id.toString(),
		});

		expect(response.data.requestUserEmailVerification).toBe(true);
		expect(sendVerificationEmailMock).toHaveBeenCalledWith(userInput.email, {
			action_link: expect.any(String),
			languageCode: LanguageCode.en,
		});

		const actionLink = sendVerificationEmailMock.mock.calls[0][1].action_link;

		const token = new URL(actionLink).searchParams.get('token');
		const userId = new URL(actionLink).searchParams.get('id');

		sendedToken = token!;
		sendedUserId = userId!;
	});

	it('throws trying to use a wrong token', async () => {
		const result = await environment.privateApiClient.query<
			VerifyUserEmailMutation,
			VerifyUserEmailMutationVariables
		>(VERIFY_USER_EMAIL, {
			token: `${sendedToken}-wrong`,
			verifyUserEmailId: sendedUserId,
		});

		expect(result.data.verifyUserEmail).toEqual(<VerifyUserEmailError>{
			errorCode: VerifyUserEmailErrorCode.InvalidToken,
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
		correctExpirationTokenDate = user.email_verification_token_expiration!;
		await environment.prisma.user.update({
			where: { email: userInput.email },
			data: { email_verification_token_expiration: new Date() },
		});

		const result = await environment.privateApiClient.query<
			VerifyUserEmailMutation,
			VerifyUserEmailMutationVariables
		>(VERIFY_USER_EMAIL, {
			token: sendedToken,
			verifyUserEmailId: sendedUserId,
		});

		expect(result.data.verifyUserEmail).toEqual(<VerifyUserEmailError>{
			errorCode: VerifyUserEmailErrorCode.ExpiredToken,
			message: expect.any(String),
		});
	});

	it('verifies user email', async () => {
		// Update the token expiration date to the correct one again
		const beforeVerifyUser = await environment.prisma.user.update({
			where: { email: userInput.email },
			data: { email_verification_token_expiration: correctExpirationTokenDate },
		});

		const result = await environment.privateApiClient.query<
			VerifyUserEmailMutation,
			VerifyUserEmailMutationVariables
		>(VERIFY_USER_EMAIL, {
			token: sendedToken,
			verifyUserEmailId: sendedUserId,
		});

		expect(result.data.verifyUserEmail).toEqual(
			expect.objectContaining(<User>{
				email: userInput.email,
			}),
		);

		const afterVerifyUser = await environment.prisma.user.findUniqueOrThrow({
			where: { email: userInput.email },
		});

		expect(beforeVerifyUser.email_verified_at).toBeNull();
		expect(afterVerifyUser.email_verified_at).not.toBeNull();

		// It should set authorization cookie after verify user email
		expect(environment.privateApiClient.lastRequestCookies).toEqual(
			expect.objectContaining({
				[CONSTANTS.USERS.cookie_name]: expect.any(String),
			}),
		);
	});
});
