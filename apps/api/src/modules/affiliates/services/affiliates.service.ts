import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CONSTANTS } from 'src/config/constants';
import {
	AffiliateSettingsResult,
	AffiliateSettingsResultErrorCode,
	CreateUserAffiliateInput,
	UpdateUserAffiliateInput,
} from 'src/graphql';
import { AccountsService } from 'src/modules/accounts/services/accounts.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { TrackingService } from 'src/modules/common/services/tracking.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { AffiliateComissionStatus, AffiliateStatus, ID } from 'src/shared/types/db';
import { getPercentFromValue } from 'src/shared/utils/math';
import { sanitizeAlias } from '../utils/sanitize';

@Injectable()
export class AffiliatesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly accountsService: AccountsService,
		private readonly trackingService: TrackingService,
		private readonly usersService: UsersService,
	) {}

	async createAccountSubscriptionComissionIfNeeded(
		accountId: number,
		paidValue: Prisma.Decimal,
	) {
		const account = await this.prisma.account.findUnique({
			where: { id: accountId },
			include: {
				affiliate_comission_affiliate_comission_accountToaccount: true,
			},
		});

		if (!account || !account.referrer) return;

		const { subscription } = await this.accountsService.findSubscriptionPlan(account);
		const affiliate = await this.prisma.affiliate.findUnique({
			where: {
				id: account.referrer,
			},
			include: {
				user_affiliate_userTouser: true,
			},
		});

		if (subscription && affiliate) {
			const accountComisions =
					account.affiliate_comission_affiliate_comission_accountToaccount,
				affiliateComissionMonthsDuration =
					affiliate.comission_duration_months ||
					CONSTANTS.AFFILIATES.default_comission_duration_months;

			const shouldCreateNewComission =
				accountComisions.length < Number(affiliateComissionMonthsDuration);

			if (shouldCreateNewComission) {
				const createdComission = await this.prisma.affiliate_comission.create({
					data: {
						amount: getPercentFromValue(
							paidValue.toNumber(),
							affiliate.comission_percentage ||
								CONSTANTS.AFFILIATES.default_comission_percentage,
						),
						status: AffiliateComissionStatus.Pending,
						account: account.id,
						affiliate: affiliate.id,
					},
				});

				await this.trackingService.affiliateComission({
					user: affiliate.user_affiliate_userTouser!,
					affiliate,
					commission_value: createdComission.amount.toNumber(),
				});
			}
		}
	}

	findAffiliateByUserId(userId: ID) {
		return this.prisma.affiliate.findUnique({
			where: { user: Number(userId) },
		});
	}

	async createAffiliateForUser(
		userId: ID,
		input: CreateUserAffiliateInput,
	): Promise<AffiliateSettingsResult> {
		const { password, ...rest } = input;

		const passwordCheck = await this.usersService.isPasswordCorrect(userId, password);

		if (!passwordCheck) {
			return {
				errorCode: AffiliateSettingsResultErrorCode.INVALID_PASSWORD,
				message: 'Invalid password',
			};
		}

		input.alias = sanitizeAlias(input.alias);

		const affiliate = await this.prisma.affiliate.create({
			data: {
				user: Number(userId),
				status: AffiliateStatus.Active,
				...rest,
			},
			include: {
				user_affiliate_userTouser: true,
			},
		});

		await this.trackingService.affiliateSignUp(
			affiliate.user_affiliate_userTouser!,
			affiliate,
		);

		return affiliate as any;
	}

	async updateAffiliateForUser(userId: ID, data: UpdateUserAffiliateInput) {
		const { password, ...rest } = data;

		const passwordCheck = await this.usersService.isPasswordCorrect(userId, password);

		if (!passwordCheck) {
			return {
				errorCode: AffiliateSettingsResultErrorCode.INVALID_PASSWORD,
				message: 'Invalid password',
			};
		}

		if (data.alias) {
			data.alias = sanitizeAlias(data.alias as string);
		}

		return this.prisma.affiliate.update({
			where: { user: Number(userId) },
			data: rest as Prisma.affiliateUpdateInput,
		});
	}

	async isAffiliateAliasAvailable(alias: string): Promise<boolean> {
		const exists = await this.prisma.affiliate.findUnique({
			where: { alias },
		});

		return !exists;
	}
}
