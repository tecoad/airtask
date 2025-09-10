import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserAffiliateInput, UpdateUserAffiliateInput } from 'src/graphql';
import { AffiliatesService } from 'src/modules/affiliates/services/affiliates.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';

@Resolver()
export class AffiliatesResolver {
	constructor(private readonly affiliatesService: AffiliatesService) {}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	createAffiliateForUser(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: CreateUserAffiliateInput,
	) {
		return this.affiliatesService.createAffiliateForUser(user.id, input);
	}

	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	updateUserAffiliate(
		@CurrentUser() user: UserJwtPayload,
		@Args('input') input: UpdateUserAffiliateInput,
	) {
		return this.affiliatesService.updateAffiliateForUser(user.id, input);
	}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	activeUserAffiliate(@CurrentUser() user: UserJwtPayload) {
		return this.affiliatesService.findAffiliateByUserId(user.id);
	}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	isAffiliateAliasAvailable(@Args('alias') alias: string) {
		return this.affiliatesService.isAffiliateAliasAvailable(alias);
	}
}
