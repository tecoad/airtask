import { ID } from '@directus/sdk';
import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Permissions } from 'src/admin-graphql';
import { SimulationModeService } from 'src/modules/admin/services/simulation-mode.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';
import { Allow } from 'src/shared/decorators/permissions';
import { MyContext } from 'src/shared/graphql/types';

@Resolver()
export class SimulationModeResolver {
	constructor(
		private readonly prisma: PrismaService,
		private readonly simulationModeService: SimulationModeService,
	) {}

	@Allow(Permissions.SuperAdmin)
	@UseGuards(UserGqlAuthGuard)
	@Mutation()
	startSimulationMode(
		@Context() ctx: MyContext,
		@CurrentUser() user: UserJwtPayload,
		@Args('focusUserId') focusUserId: ID,
	) {
		return this.simulationModeService.createSimulationMode(ctx, user, focusUserId);
	}
}
