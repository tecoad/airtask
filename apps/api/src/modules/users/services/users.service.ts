import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Prisma, user } from '@prisma/client';
import { add } from 'date-fns';
import { Permissions } from 'src/admin-graphql';
import { CONSTANTS } from 'src/config/constants';
import { ENV } from 'src/config/env';
import {
	ActiveUser,
	LanguageCode,
	LoginUserInput,
	RegisterUserInput,
	RegisterUserResult,
	ResetUserPasswordErrorCode,
	ResetUserPasswordInput,
	ResetUserPasswordResult,
	UpdateUserInput,
	User,
	UserAuthErrorCode,
	UserAuthResult,
	VerifyUserEmailErrorCode,
	VerifyUserEmailResult,
} from 'src/graphql';
import { SimulationModeService } from 'src/modules/admin/services/simulation-mode.service';
import { EmailService } from 'src/modules/common/services/email.service';
import { HasherSerice } from 'src/modules/common/services/hasher.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { MyContext } from 'src/shared/graphql/types';
import { AccountRole, AffiliateStatus, ID, SessionStatus } from 'src/shared/types/db';
import * as useragent from 'useragent';
import { v4 } from 'uuid';
import { userJwtExtractor } from '../auth/user-jwt.strategy';
import { UserJwtPayload } from '../types';
import { sanitizeEmail, sanitizeName } from '../utils/sanitize';

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly hasher: HasherSerice,
		private readonly jwtService: JwtService,
		private readonly emailService: EmailService,
		private readonly simulationModeService: SimulationModeService,
	) {}

	async findPublic(id: ID): Promise<Omit<User, 'accounts'>> {
		const user = await this.prisma.user.findUniqueOrThrow({
			where: {
				id: Number(id),
			},
		});

		return {
			id: user.id.toString(),
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
		};
	}

	async login(ctx: MyContext, input: LoginUserInput) {
		input.email = sanitizeEmail(input.email);

		const user = await this.prisma.user.findUnique({
			where: {
				email: input.email,
			},
		});

		if (!user) {
			return {
				errorCode: UserAuthErrorCode.INVALID_CREDENTIALS,
				message: 'Invalid credentials',
			};
		}

		const passwordMatch = await this.isPasswordCorrect(user, input.password);

		if (!passwordMatch) {
			return {
				errorCode: UserAuthErrorCode.INVALID_CREDENTIALS,
				message: 'Invalid credentials',
			};
		}

		if (!(await this.isEmailVerified(user))) {
			await this.requestEmailVerification(user.id);

			return {
				errorCode: UserAuthErrorCode.EMAIL_NOT_VERIFIED,
				message: 'Email isnt verified',
			};
		}

		return this.authenticate(ctx, user);
	}

	async register(ctx: MyContext, input: RegisterUserInput): Promise<RegisterUserResult> {
		input.email = sanitizeEmail(input.email);
		input.first_name = sanitizeName(input.first_name);
		input.last_name = sanitizeName(input.last_name);

		const referrerAffiliate = input.referrer
			? await this.prisma.affiliate.findUnique({
					where: {
						alias: input.referrer,
						AND: {
							status: AffiliateStatus.Active,
						},
					},
				})
			: null;

		if (input.referrer) {
			if (!referrerAffiliate) {
				delete input.referrer;
			}
		}

		const existent = await this.prisma.user.findUnique({
			where: {
				email: input.email,
			},
		});

		if (existent) {
			return {
				errorCode: UserAuthErrorCode.EMAIL_ALREADY_EXISTS,
				message: 'Email already exists',
			};
		}

		const password = await this.hasher.hash(input.password);

		const user = await this.prisma.user.create({
			data: {
				first_name: input.first_name,
				last_name: input.last_name,
				email: input.email,
				password,
				anonymous_id: ctx.req.cookies?.['anonymous-id'],
				language: input.language,
				account_user: {
					create: [
						{
							account: {
								create: {
									name: input.first_name,
									referrer: input.referrer ? referrerAffiliate!.id : undefined,
									date_created: new Date(),
								},
							},
							role: AccountRole.Owner,
						},
					],
				},
			},
		});

		await this.requestEmailVerification(user.id);

		return { created_id: user.id.toString(), should_verify_email: true };
	}

	async update(
		ctx: MyContext,
		{ id: userId }: UserJwtPayload,
		_input: UpdateUserInput,
	): Promise<UserAuthResult> {
		const user = await this.prisma.user.findUniqueOrThrow({
			where: {
				id: userId,
			},
		});

		const { old_password, ...input } = _input;

		input.first_name && (input.first_name = sanitizeName(input.first_name));
		input.last_name && (input.last_name = sanitizeName(input.last_name));
		input.email && (input.email = sanitizeEmail(input.email));

		if (input.password?.trim()) {
			const isOldPasswordCorrect = await this.isPasswordCorrect(user.id, old_password);

			if (!isOldPasswordCorrect) {
				return {
					errorCode: UserAuthErrorCode.INVALID_CREDENTIALS,
					message: 'Invalid credentials',
				};
			}

			input.password = await this.hasher.hash(input.password);
		}

		if (input.email) {
			if (input.email !== user.email) {
				const existent = await this.prisma.user.findUnique({
					where: {
						email: input.email,
					},
				});

				if (existent) {
					return {
						errorCode: UserAuthErrorCode.EMAIL_ALREADY_EXISTS,
						message: 'Email already exists',
					};
				}

				const isOldPasswordCorrect = await this.isPasswordCorrect(user.id, old_password);

				if (!isOldPasswordCorrect) {
					return {
						errorCode: UserAuthErrorCode.INVALID_CREDENTIALS,
						message: 'Invalid credentials',
					};
				}
			}
		}

		const mandatoryUserFields: (keyof UpdateUserInput)[] = [
			'email',
			'first_name',
			'last_name',
			'password',
		];

		for (const field of mandatoryUserFields) {
			// If the field is not present, is just fine
			if (input[field] !== undefined) {
				// If the field is present, but is empty, we should use the current value
				if (input[field] === null || !input[field].trim()) {
					input[field] = user[field];
				}
			}
		}

		const updated = await this.authenticate(
			ctx,
			await this.prisma.user.update({
				where: { id: Number(user.id) },
				data: input as Prisma.userUpdateInput,
			}),
		);

		return updated as any as ActiveUser;
	}

	activeUser(user?: UserJwtPayload) {
		if (!user) return null;

		return this.prisma.user.findUnique({ where: { id: user.id } });
	}

	async isPasswordCorrect(_user: user | ID, password?: string | null) {
		if (!password) return false;

		const user =
			typeof _user === 'object'
				? _user
				: await this.prisma.user.findUniqueOrThrow({
						where: { id: Number(_user) },
					});

		return this.hasher.verify(user.password!, password);
	}

	async authenticate(
		ctx: MyContext,
		_user: user,
		options?: {
			blockUpdateLastLogin?: boolean;
			simulatedByAdmin?: {
				user: user;
				originalJwt: string;
			};
			jwtOptions?: Omit<JwtSignOptions, 'secret'>;
		},
	): Promise<user> {
		let user = _user;

		// If is simulatedByAdmin, we don't wanna to change last login for the common user
		if (!options?.simulatedByAdmin && !options?.blockUpdateLastLogin) {
			user = await this.prisma.user.update({
				where: { id: user.id },
				data: { last_login: new Date() },
			});
		}

		const agent = useragent.parse(ctx.req.headers['user-agent'] || '');

		const session = await this.prisma.session.create({
			data: {
				id: v4(),
				user: user.id,
				status: SessionStatus.Valid,
				// If is simulated by admin we should register the admin id
				simulated_by_admin: options?.simulatedByAdmin?.user.id,
				ip: ctx.req.ip,
				os: agent.os.family,
				browser: agent.family,
			},
		});

		let payload: UserJwtPayload = {
			sessionId: session.id,
			id: user.id,
			email: user.email,
			authenticatedAt: new Date().toISOString(),
		};

		if (options?.simulatedByAdmin) {
			payload = {
				...payload,
				simulated: true,
				originalAdmin: {
					id: options.simulatedByAdmin.user.id,
					token: options.simulatedByAdmin.originalJwt,
				},
			};
		}

		const token = this.jwtService.sign(payload, {
			expiresIn: CONSTANTS.USERS.jwt_expires,
			...options?.jwtOptions,
			secret: ENV.USERS.jwt_token_secret,
		});

		this.updateJwtToken(ctx, token);
		// We need this because some resolvers uses '@CurrentUser' decorator
		// and if it is not set (such as at login), it will throw an error
		(ctx.req as any).user = payload;

		return user;
	}

	updateJwtToken(ctx: MyContext, token: string) {
		ctx.res.cookie(CONSTANTS.USERS.cookie_name, token, CONSTANTS.USERS.COOKIE_OPTIONS);
		ENV.USERS.token_header && ctx.res.setHeader(ENV.USERS.token_header!, token);
	}

	async logout(ctx: MyContext) {
		const jwt = userJwtExtractor(ctx.req);

		if (jwt) {
			try {
				const user = await this.jwtService.verifyAsync(jwt, {
					secret: ENV.USERS.jwt_token_secret,
				});

				try {
					await this.prisma.session.update({
						where: { id: user.sessionId },
						data: { status: SessionStatus.Invalid },
					});
				} catch {
					/**  */
				}

				if (user.simulated) {
					return this.simulationModeService.exitSimulationMode(ctx, user);
				}
			} catch {
				/** */
			}
		}

		ctx.res.clearCookie(CONSTANTS.USERS.cookie_name, CONSTANTS.USERS.COOKIE_OPTIONS);

		return true;
	}

	async requestEmailVerification(id: ID): Promise<boolean> {
		const token = v4();

		// Ensure that the user exists
		const user = await this.prisma.user.findUniqueOrThrow({
			where: { id: Number(id) },
		});

		if (!(await this.isEmailVerified(user))) {
			const updated = await this.prisma.user.update({
				where: {
					id: Number(id),
				},
				data: {
					email_verification_token: token,
					email_verification_token_expiration: add(
						new Date(),
						CONSTANTS.USERS.email_verification_token_expiration,
					),
				},
			});

			await this.emailService.sendVerificationEmail(updated.email, {
				action_link: ENV.REDIRECTS.verify_email_action_link(token, updated.id),
				languageCode: updated.language as LanguageCode,
			});
		}

		return true;
	}

	async verifyEmail(
		ctx: MyContext,
		id: ID,
		token: string,
	): Promise<VerifyUserEmailResult> {
		const user = await this.prisma.user.findUniqueOrThrow({
			where: { id: Number(id) },
		});

		if (
			!user.email_verification_token ||
			user.email_verification_token !== token.trim()
		) {
			return {
				errorCode: VerifyUserEmailErrorCode.INVALID_TOKEN,
				message: 'Invalid token',
			};
		}

		if (user.email_verification_token_expiration! < new Date()) {
			return {
				errorCode: VerifyUserEmailErrorCode.EXPIRED_TOKEN,
				message: 'Token expired',
			};
		}

		const updated = await this.prisma.user.update({
			where: { id: Number(id) },
			data: {
				email_verified_at: new Date(),
				email_verification_token: null,
				email_verification_token_expiration: null,
			},
		});

		await this.authenticate(ctx, updated);

		return updated as any;
	}

	async isEmailVerified(mayBeUser: number | user) {
		const user =
			typeof mayBeUser === 'number'
				? await this.prisma.user.findUniqueOrThrow({ where: { id: mayBeUser } })
				: mayBeUser;

		return !!user.email_verified_at;
	}

	async requestPasswordReset(email: string) {
		const user = await this.prisma.user.findUnique({
			where: { email },
		});

		// We don't want to give any information about the existence of an email
		if (!user) {
			return true;
		}

		const token = v4();

		await this.prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				password_reset_token: token,
				password_reset_token_expiration: add(
					new Date(),
					CONSTANTS.USERS.password_reset_token_expiration,
				),
			},
		});

		await this.emailService.sendPasswordReset(user.email, {
			action_link: ENV.REDIRECTS.reset_password_action_link(token),
			token,
			languageCode: user.language as LanguageCode,
		});

		return true;
	}

	async resetPassword(
		ctx: MyContext,
		{ token, password }: ResetUserPasswordInput,
	): Promise<ResetUserPasswordResult> {
		const user = await this.prisma.user.findFirst({
			where: {
				password_reset_token: token,
			},
		});

		if (
			!user ||
			!user.password_reset_token ||
			user.password_reset_token !== token.trim()
		) {
			return {
				errorCode: ResetUserPasswordErrorCode.INVALID_TOKEN,
				message: 'Invalid token',
			};
		}

		if (user.password_reset_token_expiration! < new Date()) {
			return {
				errorCode: ResetUserPasswordErrorCode.EXPIRED_TOKEN,
				message: 'Token expired',
			};
		}

		const hashedPassword = await this.hasher.hash(password);
		await this.prisma.user.update({
			where: { id: user.id },
			data: {
				password: hashedPassword,
				password_reset_token: null,
				password_reset_token_expiration: null,
			},
		});

		await this.authenticate(ctx, user);

		return user as any as User;
	}

	async listAccounts(userId: ID) {
		return this.prisma.account_user.findMany({
			where: {
				user_id: Number(userId),
			},
		});
	}

	async userPermissions(_user: user | ID): Promise<Permissions[]> {
		const user =
			typeof _user === 'object'
				? _user
				: await this.prisma.user.findUnique({ where: { id: Number(_user) } });

		if (!user) return [];

		const allPermissions = Object.values(Permissions);

		const userPermissions =
			(user.permissions as Permissions[] | undefined)?.filter((item) => {
				// SuperAdmin permission can only be grant by ENV
				if (item === Permissions.SuperAdmin) return false;

				// if there is a permission on db array that isn't at permissions enum, remove it
				return allPermissions.includes(item);
			}) ?? [];

		if (ENV.ADMIN.users_ids_with_super_admin?.includes(user.id.toString())) {
			userPermissions.push(Permissions.SuperAdmin);
		}

		return userPermissions;
	}
}
