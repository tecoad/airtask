import { UseGuards } from '@nestjs/common';
import {
	Args,
	Context,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { account_user, user } from '@prisma/client';
import { LoginUserInput, RegisterUserInput, ResetUserPasswordInput } from 'src/graphql';
import { AccountsService } from 'src/modules/accounts/services/accounts.service';
import { AffiliatesService } from 'src/modules/affiliates/services/affiliates.service';
import { CurrentUser } from 'src/shared/decorators';
import { MyContext } from 'src/shared/graphql/types';
import { UserGqlAuthGuard } from '../../../../users/auth/user-auth.guard';
import { UsersService } from '../../../../users/services/users.service';
import { UserJwtPayload } from '../../../../users/types';

@Resolver('ActiveUser')
export class UsersResolver {
	constructor(
		private readonly usersService: UsersService,
		private readonly affiliateService: AffiliatesService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	activeUser(@CurrentUser() user: UserJwtPayload) {
		return this.usersService.activeUser(user);
	}

	@Mutation()
	registerUser(@Context() ctx: MyContext, @Args('input') input: RegisterUserInput) {
		return this.usersService.register(ctx, input);
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	updateUser(
		@Context() ctx: MyContext,
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: any,
	) {
		return this.usersService.update(ctx, user, input);
	}

	@Mutation()
	loginUser(@Context() ctx: MyContext, @Args('input') input: LoginUserInput) {
		return this.usersService.login(ctx, input);
	}

	@Mutation()
	logoutUser(@Context() ctx: MyContext) {
		return this.usersService.logout(ctx);
	}

	@Mutation()
	requestUserEmailVerification(@Args('id') id: number) {
		return this.usersService.requestEmailVerification(id);
	}

	@Mutation()
	verifyUserEmail(
		@Context() ctx: MyContext,
		@Args('token') token: string,
		@Args('id') id: number,
	) {
		return this.usersService.verifyEmail(ctx, id, token);
	}

	@Mutation()
	requestUserPasswordReset(@Args('email') email: string) {
		return this.usersService.requestPasswordReset(email);
	}

	@Mutation()
	resetUserPassword(
		@Context() ctx: MyContext,
		@Args('input') input: ResetUserPasswordInput,
	) {
		return this.usersService.resetPassword(ctx, input);
	}

	@ResolveField('accounts')
	async userAccounts(@CurrentUser() currentUser: UserJwtPayload, @Parent() user: user) {
		// This should be a info that is only available to the user itself
		if (currentUser.id !== user.id) {
			return [];
		}

		return this.usersService.listAccounts(user.id);
	}

	@ResolveField('is_affiliate')
	async isAffiliate(@CurrentUser() currentUser: UserJwtPayload, @Parent() user: user) {
		if (currentUser.id !== user.id) {
			return null;
		}

		return !!(await this.affiliateService.findAffiliateByUserId(user.id));
	}

	@ResolveField('last_login')
	lastLogin(@CurrentUser() currentUser: UserJwtPayload, @Parent() user: user) {
		if (currentUser.id !== user.id) {
			return null;
		}

		return user.last_login;
	}

	@ResolveField('anonymous_id')
	anonymous_id(@CurrentUser() currentUser: UserJwtPayload, @Parent() user: user) {
		if (currentUser.id !== user.id) {
			return null;
		}

		return user.anonymous_id;
	}

	@ResolveField('permissions')
	permissions(@Parent() user: user) {
		return this.usersService.userPermissions(user);
	}
}

@Resolver('UserAccount')
export class UserAccountsResolver {
	constructor(
		private readonly usersService: UsersService,
		private readonly accountsService: AccountsService,
	) {}

	@ResolveField('account')
	account(@Parent() userAccount: account_user) {
		return this.accountsService.find(userAccount.account_id!);
	}

	@ResolveField('user')
	user(@Parent() userAccount: account_user) {
		return this.usersService.findPublic(userAccount.user_id!);
	}

	@ResolveField('allowed_modules')
	async allowedModules(@Parent() userAccount: account_user) {
		const { plan } = await this.accountsService.findSubscriptionPlan(
			userAccount.account_id!,
		);

		return plan?.allowed_modules || [];
	}
}
