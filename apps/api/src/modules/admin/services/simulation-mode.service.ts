import { ID } from '@directus/sdk';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { userJwtExtractor } from 'src/modules/users/auth/user-jwt.strategy';
import { UsersService } from 'src/modules/users/services/users.service';
import { UserJwtPayload } from 'src/modules/users/types';
import { MyContext } from 'src/shared/graphql/types';

@Injectable()
export class SimulationModeService {
	constructor(
		private readonly prisma: PrismaService,
		@Inject(forwardRef(() => UsersService))
		private readonly usersService: UsersService,
	) {}

	async createSimulationMode(
		ctx: MyContext,
		{ id: adminId }: UserJwtPayload,
		focusUserId: ID,
	) {
		const admin = await this.prisma.user.findUniqueOrThrow({
				where: { id: Number(adminId) },
			}),
			focusUser = await this.prisma.user.findUniqueOrThrow({
				where: { id: Number(focusUserId) },
			});

		return this.usersService.authenticate(ctx, focusUser, {
			simulatedByAdmin: {
				user: admin,
				originalJwt: userJwtExtractor(ctx.req)!,
			},
			jwtOptions: {
				expiresIn: '1d',
			},
		});
	}

	async exitSimulationMode(ctx: MyContext, adminJwt: UserJwtPayload) {
		if (adminJwt.simulated) {
			this.usersService.updateJwtToken(ctx, adminJwt.originalAdmin.token);

			return true;
		}

		return false;
	}
}
