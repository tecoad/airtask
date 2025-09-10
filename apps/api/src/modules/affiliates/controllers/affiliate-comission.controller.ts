import { Body, Controller, Post, Request, UnauthorizedException } from '@nestjs/common';
import { ENV } from 'src/config/env';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { parseDateFromPtBr } from 'src/modules/metrics/helpers/date';
import { AffiliateComissionStatus } from 'src/shared/types/db';
import { PendingAffiliateSumPayload } from '../dto/pending-affiliate-sum.dto';
import { AffiliateComissionsService } from '../services/affiliate-comissions.service';

@Controller('affiliate/comissions')
export class AffiliateComissionsController {
	constructor(
		private readonly prisma: PrismaService,
		private readonly affiliatesComissionService: AffiliateComissionsService,
	) {}

	private authOperation(token: string) {
		if (!ENV.AFFILIATE.controller_token || token !== ENV.AFFILIATE.controller_token) {
			throw new UnauthorizedException();
		}
	}

	@Post('/pending-sum')
	async pendingSum(
		@Request() req: Request,
		@Body() data: PendingAffiliateSumPayload,
		returnAllItems: boolean | undefined,
	) {
		const token = req.headers['Authorization'] || req.headers['authorization'];
		this.authOperation(token);

		const affiliate = await this.prisma.affiliate.findUniqueOrThrow({
			where: { id: data.affiliateId },
		});

		const from = parseDateFromPtBr(data.rangeFrom),
			to = parseDateFromPtBr(data.rangeTo);

		const { sum, items } =
			await this.affiliatesComissionService.sumAffiliateComissionsAmountByQuery(
				affiliate,
				{
					status: AffiliateComissionStatus.Pending,
					date_created: {
						gte: from,
						lte: to,
					},
				},
			);

		const user = await this.prisma.user.findUnique({
			where: { id: affiliate.user! },
		});

		return {
			totalSum: sum,
			quantityOfComissions: items.length,
			dateSearchTerm: `${from.toDateString()} - ${to.toDateString()}`,
			affiliate: {
				alias: affiliate.alias,
				name: `${user?.first_name} ${user?.last_name}`,
				email: user?.email,
			},
			items: returnAllItems ? items : undefined,
		};
	}

	@Post('/set-pending-as-paid')
	async setPendingAsPaid(
		@Body() data: PendingAffiliateSumPayload,
		@Request() req: Request,
	) {
		const infos = await this.pendingSum(req, data, true);

		for (const item of infos.items!) {
			await this.prisma.affiliate_comission.update({
				where: {
					id: item.id,
				},
				data: {
					status: AffiliateComissionStatus.Paid,
				},
			});
		}

		return {
			message: 'All items successfully updated as Paid',
			...infos,
			items: undefined,
		};
	}
}
