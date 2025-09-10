import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { Permissions } from 'src/admin-graphql';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UsersService } from 'src/modules/users/services/users.service';
import { UserJwtPayload } from 'src/modules/users/types';
import { PERMISSIONS_METADATA_KEY } from '../decorators/permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly prisma: PrismaService,
		private readonly userAuthGuard: UserGqlAuthGuard,
		private readonly usersService: UsersService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredPermissions = this.reflector.getAllAndOverride<Permissions[]>(
			PERMISSIONS_METADATA_KEY,
			[context.getHandler(), context.getClass()],
		);
		if (!requiredPermissions) return true;
		// we need to make sure req.user is available here. For that, because of this guard is global,
		// it will probably be executed before the auth that is local, so we call it here.
		await this.userAuthGuard.canActivate(context);

		const request = GqlExecutionContext.create(context).getContext().req as Request;

		const userJwt = request.user as UserJwtPayload;

		if (!userJwt) return false;

		const user = await this.prisma.user.findUnique({
			where: {
				id: userJwt.id,
			},
		});

		if (!user) return false;

		const userPermissions = await this.usersService.userPermissions(user);

		return (
			// if the user is a super admin, he has access to everything
			userPermissions.includes(Permissions.SuperAdmin) ||
			requiredPermissions.some((v) => userPermissions?.includes(v))
		);
	}
}
