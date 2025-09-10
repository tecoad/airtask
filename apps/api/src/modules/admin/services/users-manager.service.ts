import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/modules/common/services/prisma.service';

@Injectable()
export class AdminUsersManagerService {
	constructor(private readonly prisma: PrismaService) {}

	listAll(args: Prisma.userFindManyArgs) {
		return this.prisma.user.findMany({
			...args,
		});
	}

	count(where: Prisma.userFindManyArgs['where']) {
		return this.prisma.user.count({
			where,
		});
	}
}
