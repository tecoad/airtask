import { Injectable } from '@nestjs/common';
import { Prisma, affiliate } from '@prisma/client';
import {
	addBusinessDays,
	addDays,
	addMonths,
	isAfter,
	isSameDay,
	isWeekend,
	startOfMonth,
} from 'date-fns';
import * as moment from 'moment-timezone';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { ID } from 'src/shared/types/db';

@Injectable()
export class AffiliateComissionsService {
	constructor(private readonly prisma: PrismaService) {}

	listAll(affiliateId: number, args: Prisma.affiliate_comissionFindManyArgs) {
		return this.prisma.affiliate_comission.findMany({
			...args,
			where: {
				...args.where,
				affiliate: affiliateId,
			},
		});
	}

	count(affiliateId: number, args: Prisma.affiliate_comissionFindManyArgs['where']) {
		return this.prisma.affiliate_comission.count({
			where: {
				...args,
				affiliate: affiliateId,
			},
		});
	}

	async sumAffiliateComissionsAmountByQueryByUserId(
		userId: ID,
		query: Prisma.affiliate_comissionFindManyArgs['where'],
	) {
		const affiliate = await this.prisma.affiliate.findUnique({
			where: {
				user: Number(userId),
			},
		});

		return this.sumAffiliateComissionsAmountByQuery(affiliate!, query);
	}

	async quantityOfUsersIndicatedByUserId(userId: ID) {
		const affiliate = await this.prisma.affiliate.findUniqueOrThrow({
			where: {
				user: Number(userId),
			},
		});

		return this.prisma.account.count({
			where: {
				referrer: affiliate.id,
			},
		});
	}

	async sumAffiliateComissionsAmountByQuery(
		_affiliate: affiliate | number,
		query: Prisma.affiliate_comissionFindManyArgs['where'],
	) {
		const affiliate =
			typeof _affiliate === 'object'
				? _affiliate
				: await this.prisma.affiliate.findUniqueOrThrow({
						where: { id: _affiliate },
				  });

		const pendingComissions = await this.prisma.affiliate_comission.findMany({
			where: {
				affiliate: affiliate.id,
				AND: {
					...query,
				},
			},
		});

		return {
			sum: pendingComissions.reduce(
				(acc, item) => acc.add(item.amount),
				new Prisma.Decimal(0),
			),
			items: pendingComissions,
			affiliate,
		};
	}

	get nextPaymentDay() {
		const dateInBrTimeZone = moment.tz('America/Sao_Paulo');
		const currentDate = dateInBrTimeZone.toDate();

		let firstDayCurrentMonth = startOfMonth(currentDate);

		// If the first day of the month is not a business day (Saturday or Sunday),
		// adjust to the next business day.
		while (isWeekend(firstDayCurrentMonth)) {
			firstDayCurrentMonth = addDays(firstDayCurrentMonth, 1);
		}

		const fifthBusinessDayCurrentMonth = addBusinessDays(firstDayCurrentMonth, 4);

		// If the fifth business day of the current month has not yet passed, we return this date
		if (
			isAfter(fifthBusinessDayCurrentMonth, currentDate) ||
			isSameDay(fifthBusinessDayCurrentMonth, currentDate)
		) {
			return fifthBusinessDayCurrentMonth;
		}

		// If the fifth business day of the current month has already passed, we calculate the fifth business day of the next month
		let firstDayNextMonth = startOfMonth(addMonths(currentDate, 1));

		// Similarly, if the first day of the next month is not a business day, adjust to the next business day.
		while (isWeekend(firstDayNextMonth)) {
			firstDayNextMonth = addDays(firstDayNextMonth, 1);
		}

		const fifthBusinessDayNextMonth = addBusinessDays(firstDayNextMonth, 4);

		return fifthBusinessDayNextMonth;
	}
}
