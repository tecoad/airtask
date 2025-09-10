import { UseGuards } from '@nestjs/common';
import { Args, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { AffiliateComissionsService } from 'src/modules/affiliates/services/affiliate-comissions.service';
import { UserGqlAuthGuard } from 'src/modules/users/auth/user-auth.guard';
import { UserJwtPayload } from 'src/modules/users/types';
import { CurrentUser } from 'src/shared/decorators';
import { AffiliateComissionStatus } from 'src/shared/types/db';

@Resolver('AffiliateComissionsCalcs')
export class AffiliateComissionsCalcsResolver {
	constructor(private readonly affiliateComissionsService: AffiliateComissionsService) {}

	@UseGuards(UserGqlAuthGuard)
	@Query()
	affiliateComissionsCalcs() {
		return {};
	}

	@ResolveField()
	async paidAmountByPeriod(
		@CurrentUser() user: UserJwtPayload,
		@Args('from') from: Date | undefined,
		@Args('to') to: Date | undefined,
	): Promise<Prisma.Decimal> {
		const { sum } =
			await this.affiliateComissionsService.sumAffiliateComissionsAmountByQueryByUserId(
				user.id,
				{
					status: AffiliateComissionStatus.Paid,
					date_created: {
						gte: from,
						lte: to,
					},
				},
			);

		return sum;
	}

	@ResolveField()
	async pendingAmountToReceive(
		@CurrentUser() user: UserJwtPayload,
	): Promise<Prisma.Decimal> {
		const { sum } =
			await this.affiliateComissionsService.sumAffiliateComissionsAmountByQueryByUserId(
				user.id,
				{
					status: AffiliateComissionStatus.Pending,
				},
			);

		return sum;
	}

	@ResolveField()
	nextPaymentDate() {
		return this.affiliateComissionsService.nextPaymentDay;
	}

	@ResolveField()
	async amountOfUsersIndicated(@CurrentUser() user: UserJwtPayload) {
		return this.affiliateComissionsService.quantityOfUsersIndicatedByUserId(user.id);
	}
}
