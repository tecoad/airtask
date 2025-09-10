import { UnauthorizedException } from '@nestjs/common';
import { CONSTANTS } from 'src/config/constants';
import { AccountUsageKind } from 'src/graphql';
import { UsersService } from 'src/modules/users/services/users.service';
import { AccountRole, ID } from 'src/shared/types/db';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import {
	ACTIVE_USER,
	ACTIVE_USER_WITH_ACCOUNTS,
	LOGIN_USER,
	LOGOUT_USER,
	REGISTER_USER,
} from 'test/shared/gql/private/user';
import {
	ActiveUser,
	ActiveUserQuery,
	ActiveUserQueryVariables,
	LanguageCode,
	LoginUserMutation,
	LoginUserMutationVariables,
	LogoutUserMutation,
	LogoutUserMutationVariables,
	RegisterUserMutation,
	RegisterUserMutationVariables,
	UserAuthErrorCode,
	UserRegistered,
} from 'test/shared/test-gql-private-api-schema.ts';

jest.setTimeout(15000);

// Using this mock on e2e because
// is the best way to test email sending
const requestEmailVerificationSpy = jest
	.spyOn(UsersService.prototype, 'requestEmailVerification')
	.mockImplementation(jest.fn());

describe('User Authentication', () => {
	let environment: TestEnvironment;
	const user = {
		email: 'test-email@gmail.com',
		first_name: 'Test-first-name',
		last_name: 'Test-last-name',
		language: LanguageCode.En,
	};

	beforeEach(() => {
		requestEmailVerificationSpy.mockClear();
	});

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		try {
			const userAtDb = await environment.prisma.user.findUnique({
				where: { email: user.email },
				include: {
					account_user: true,
				},
			});

			// Delete all user data
			if (userAtDb) {
				if (userAtDb.account_user[0]?.account_id) {
					const subscription = await environment.prisma.subscription.findFirst({
							where: {
								account: userAtDb.account_user[0].account_id,
							},
							include: {
								subscription_plan_subscription_subscription_planTosubscription_plan: true,
							},
						}),
						subscriptionPlan =
							subscription?.subscription_plan_subscription_subscription_planTosubscription_plan;

					await environment.prisma.account_user.delete({
						where: {
							id: userAtDb.account_user[0].id,
						},
					});

					await environment.prisma.subscription.delete({
						where: {
							id: subscription!.id,
						},
					});
					await environment.prisma.subscription_plan.delete({
						where: {
							id: subscriptionPlan!.id,
						},
					});
				}
				await environment.prisma.user.delete({
					where: {
						id: userAtDb?.id,
					},
				});
			}
		} catch (e) {
			console.log(e);
			/** */
		}
	});

	afterAll(async () => {
		await environment.close();
	});

	let userId: ID;

	it('registers a user', async () => {
		const { data } = await environment.privateApiClient.query<
			RegisterUserMutation,
			RegisterUserMutationVariables
		>(REGISTER_USER, {
			input: {
				...user,
				password: 'test-password',
			},
		});

		userId = Number((data.registerUser as UserRegistered).created_id);
		// Email verification was requested
		expect(requestEmailVerificationSpy).toHaveBeenCalledWith(userId);
		expect(data.registerUser).toEqual(<RegisterUserMutation['registerUser']>{
			created_id: expect.any(String),
			should_verify_email: true,
		});
	});

	it('register creates a account to user as owner', async () => {
		const created = await environment.prisma.user.findUniqueOrThrow({
			where: { email: user.email },
			include: {
				account_user: true,
			},
		});

		expect(created.account_user[0].role).toEqual(AccountRole.Owner);
	});

	it('throws email existent on duplication', async () => {
		const { data } = await environment.privateApiClient.query<
			RegisterUserMutation,
			RegisterUserMutationVariables
		>(REGISTER_USER, {
			input: {
				...user,
				password: 'test-password',
			},
		});

		expect(data.registerUser).toEqual(<RegisterUserMutation['registerUser']>{
			errorCode: UserAuthErrorCode.EmailAlreadyExists,
			message: expect.any(String),
		});
	});

	it('should not be logged after register', async () => {
		await expect(
			environment.privateApiClient.query<ActiveUserQuery, ActiveUserQueryVariables>(
				ACTIVE_USER,
			),
		).rejects.toThrowError(new UnauthorizedException().message);
	});

	it('login throws invalid credentials with invalid password', async () => {
		const { data } = await environment.privateApiClient.query<
			LoginUserMutation,
			LoginUserMutationVariables
		>(LOGIN_USER, {
			input: {
				email: user.email,
				password: `wrong-password`,
			},
		});

		expect(data.loginUser).toEqual(<LoginUserMutation['loginUser']>{
			errorCode: UserAuthErrorCode.InvalidCredentials,
			message: expect.any(String),
		});
	});

	it('login throws if email is not verified', async () => {
		const { data } = await environment.privateApiClient.query<
			LoginUserMutation,
			LoginUserMutationVariables
		>(LOGIN_USER, {
			input: {
				email: user.email,
				password: 'test-password',
			},
		});

		expect(data.loginUser).toEqual(<LoginUserMutation['loginUser']>{
			errorCode: UserAuthErrorCode.EmailNotVerified,
			message: expect.any(String),
		});
		// Email verification was requested
		expect(requestEmailVerificationSpy).toHaveBeenCalledWith(userId);
	});

	it('login', async () => {
		// Set user email as verified
		await environment.prisma.user.update({
			where: { id: Number(userId) },
			data: {
				email_verified_at: new Date(),
			},
		});

		const { data } = await environment.privateApiClient.query<
			LoginUserMutation,
			LoginUserMutationVariables
		>(LOGIN_USER, {
			input: {
				email: user.email,
				password: `test-password`,
			},
		});

		expect(data.loginUser).toEqual(
			expect.objectContaining(<Partial<LoginUserMutation['loginUser']>>{
				id: expect.any(String),
				last_login: expect.any(String),
				is_affiliate: false,
				...user,
			}),
		);

		// Is the cookie set?
		expect(environment.privateApiClient.lastRequestCookies).toEqual(
			expect.objectContaining({
				[CONSTANTS.USERS.cookie_name]: expect.any(String),
			}),
		);
		environment.privateApiClient.setAuthorizationToken(
			environment.privateApiClient.lastRequestCookies[CONSTANTS.USERS.cookie_name],
		);

		const { data: activeUserData } = await environment.privateApiClient.query<
			ActiveUserQuery,
			ActiveUserQueryVariables
		>(ACTIVE_USER);

		expect(activeUserData.activeUser).toEqual(<ActiveUserQuery['activeUser']>{
			id: (data.loginUser as ActiveUser).id,
			...user,
		});
	});

	it('query for user accounts on active user', async () => {
		const userAccount = await environment.prisma.account_user.findFirstOrThrow({
			where: {
				user_id: Number(userId),
			},
			include: {
				account: true,
			},
		});
		// Here we create a subscription and plan to user to test allowed modules
		await environment.prisma.account.update({
			where: {
				id: userAccount.account_id!,
			},
			data: {
				subscription_subscription_accountToaccount: {
					create: {
						subscription_plan_subscription_subscription_planTosubscription_plan: {
							create: {
								name: 'Test Account Subscription Plan',
								allowed_modules: [AccountUsageKind.quotation],
							},
						},
					},
				},
			},
		});

		const { data } = await environment.privateApiClient.query<
			ActiveUserQuery,
			ActiveUserQueryVariables
		>(ACTIVE_USER_WITH_ACCOUNTS);

		expect(data.activeUser).toEqual({
			id: expect.any(String),
			last_login: expect.any(String),
			is_affiliate: false,
			...user,
			accounts: [
				{
					role: AccountRole.Owner,
					allowed_modules: [AccountUsageKind.quotation],
					account: expect.objectContaining({
						id: userAccount.account_id?.toString(),
						name: userAccount.account?.name,
					}),
				},
			],
		});
	});

	it('logout', async () => {
		await environment.privateApiClient.query<
			LogoutUserMutation,
			LogoutUserMutationVariables
		>(LOGOUT_USER);

		// Assert the cookie was deleted to remove from authorization token
		expect(
			environment.privateApiClient.lastRequestCookies[CONSTANTS.USERS.cookie_name],
		).toBeFalsy();
		environment.privateApiClient.deleteAuthorizationToken();

		await expect(
			environment.privateApiClient.query<ActiveUserQuery, ActiveUserQueryVariables>(
				ACTIVE_USER,
			),
		).rejects.toThrowError(new UnauthorizedException().message);
	});
});
