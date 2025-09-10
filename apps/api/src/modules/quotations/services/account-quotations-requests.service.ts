import { Injectable } from '@nestjs/common';
import { Prisma, quotation_request } from '@prisma/client';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { UserJwtPayload } from 'src/modules/users/types';
import { ID } from 'src/shared/types/db';

@Injectable()
export class AccountQuotationsRequestsService {
	constructor(private readonly prisma: PrismaService) {}

	find(id: ID) {
		return this.prisma.quotation_request.findUnique({
			where: {
				id: String(id),
			},
		});
	}

	findBySequential(quotationId: ID, requestSequentialId: ID) {
		return this.prisma.quotation_request.findFirst({
			where: {
				sequential_id: Number(requestSequentialId),
				quotation: String(quotationId),
			},
		});
	}

	listAll(accountId: ID, args: Prisma.quotation_requestFindManyArgs) {
		return this.prisma.quotation_request.findMany({
			...args,
			where: {
				...args.where,
				account: Number(accountId),
			},
		});
	}

	count(accountId: ID, args: Prisma.quotation_requestFindManyArgs['where']) {
		return this.prisma.quotation_request.count({
			where: {
				...args,
				account: Number(accountId),
			},
		});
	}

	async toggleCheck(user: UserJwtPayload, quotationRequest: quotation_request) {
		const data: Prisma.quotation_requestUpdateArgs['data'] = {};

		// Is checked
		if (quotationRequest.checked_at) {
			data.checked_at = null;
			data.checked_by = null;
		} else {
			// Visualize request if not visualized
			await this.visualizeRequest(quotationRequest, user.id);

			data.checked_at = new Date();
			data.checked_by = user.id;
		}

		return this.prisma.quotation_request.update({
			where: {
				id: quotationRequest.id,
			},
			data,
		});
	}

	async isRequestVisualizedForUser(request: quotation_request, userId: number) {
		const requestViews = await this.prisma.quotation_request_user_view.findMany({
			where: {
				quotation_request: request.id,
			},
		});

		return requestViews.find((item) => item.user === userId);
	}

	async visualizeRequest(request: quotation_request, userId: number) {
		// Prevent duplication
		if (await this.isRequestVisualizedForUser(request, userId)) {
			return true;
		}

		await this.prisma.quotation_request_user_view.create({
			data: {
				user: userId,
				quotation_request: request.id,
			},
		});

		return true;
	}

	async generateQuotationSequentialId(
		trx: Pick<typeof this.prisma, 'quotation_request'>,
		quotationId: string,
	) {
		const requestsForThisQuotation = await trx.quotation_request.count({
			where: {
				quotation: quotationId,
			},
		});

		return requestsForThisQuotation + 1;
	}
}
