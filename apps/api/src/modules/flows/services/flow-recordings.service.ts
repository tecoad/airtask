import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { ID } from 'src/shared/types/db';

@Injectable()
export class FlowRecordingsService {
	constructor(private readonly prisma: PrismaService) {}

	listAll(accountId: ID, args: Prisma.flow_interaction_recordingFindManyArgs) {
		return this.prisma.flow_interaction_recording.findMany({
			...args,
			where: {
				...args.where,
				account: Number(accountId),
			},
		});
	}

	count(accountId: ID, args: Prisma.flow_interaction_recordingFindManyArgs['where']) {
		return this.prisma.flow_interaction_recording.count({
			where: {
				...args,
				account: Number(accountId),
			},
		});
	}
}
