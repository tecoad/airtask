import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CreateAccountApiKeyInput } from 'src/graphql';
import { AccountApiKeyService } from 'src/modules/accounts/services/account-api-key.service';
import { AccountPermissionsManagerService } from 'src/modules/accounts/services/account-permissions-manager.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';
import { EntityNotFoundError } from 'src/shared/errors';
import { ID } from 'src/shared/types/db';
import { UnwrapPromise } from 'src/shared/utils/generics';

@Resolver('AccountApiKey')
export class AccountApiKeysResolver {
	constructor(
		private readonly accountApiKeyService: AccountApiKeyService,
		private readonly accountsPermissionsManager: AccountPermissionsManagerService,
	) {}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async createAccountApiKey(
		@Args('input') input: CreateAccountApiKeyInput,
		@CurrentUser() user: UserJwtPayload,
	): Promise<UnwrapPromise<ReturnType<this['accountApiKeys']>>[number]> {
		await this.accountsPermissionsManager.throwIfUserNotAManagerOfAccount(
			user.id,
			Number(input.accountId),
		);

		return {
			...(await this.accountApiKeyService.create(user, input)),
			isCreateOperation: true,
		};
	}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	async accountApiKeys(
		@Args('accountId') accountId: ID,
		@CurrentUser() user: UserJwtPayload,
	) {
		await this.accountsPermissionsManager.throwIfUserNotAManagerOfAccount(
			user.id,
			Number(accountId),
		);

		return (await this.accountApiKeyService.list(accountId)).map((v) => ({
			...v,
			isCreateOperation: false,
		}));
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	async deleteAccountApiKey(@Args('id') id: ID, @CurrentUser() user: UserJwtPayload) {
		const item = await this.accountApiKeyService.find(id);

		if (!item) throw new EntityNotFoundError('account_api_key', id);

		await this.accountsPermissionsManager.throwIfUserNotAManagerOfAccount(
			user.id,
			Number(item.account),
		);

		await this.accountApiKeyService.delete(id);
		return true;
	}

	@ResolveField()
	token(@Parent() parent: UnwrapPromise<ReturnType<this['accountApiKeys']>>[number]) {
		return parent.isCreateOperation ? parent.token : null;
	}

	@ResolveField()
	maskedToken(
		@Parent() parent: UnwrapPromise<ReturnType<this['accountApiKeys']>>[number],
	) {
		return `****${parent.token?.slice(-4)}`;
	}
}
