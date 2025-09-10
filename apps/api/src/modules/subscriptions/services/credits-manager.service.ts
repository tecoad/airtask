import { Injectable } from '@nestjs/common';
import { Prisma, subscription_plan_price } from '@prisma/client';
import { AccountUsageKind } from 'src/graphql';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import {
	AccountCreditTransactionReason,
	AccountCreditTransactionType,
} from 'src/shared/types/db';
import { v4 } from 'uuid';
import { CreditTransactionReasonMetadata } from '../types/credit-transaction';

export type CreditTransactionInput<Reason extends AccountCreditTransactionReason> = {
	reason: Reason;
	reasonMetadata: Reason extends keyof CreditTransactionReasonMetadata
		? CreditTransactionReasonMetadata[Reason]
		: undefined;
};

@Injectable()
export class CreditsManagerService {
	constructor(private readonly prisma: PrismaService) {}

	async removeCreditGivenByPlan(accountId: number) {
		const credit = await this.prisma.account_credit.findFirst({
			where: {
				account: accountId,
				is_given_by_plan: true,
			},
		});

		if (!credit) return;

		await this.update(credit.id, {
			newBalance: new Prisma.Decimal(0),
			newAmount: new Prisma.Decimal(0),
			reason: AccountCreditTransactionReason.PlanCancellation,
			reasonMetadata: undefined,
		});
	}

	async updateCreditGivenByPlanOnPlanChange(
		accountId: number,
		price: subscription_plan_price,
	) {
		if (!price.monthly_given_balance) return;

		const credit = await this.prisma.account_credit.findFirst({
			where: {
				account: accountId,
				is_given_by_plan: true,
			},
		});

		// If there is no credit given by plan, create one
		if (!credit) {
			return this.creditForAccount(accountId, {
				amount: price.monthly_given_balance,
				isGivenByPlan: true,
				reason: AccountCreditTransactionReason.PlanCreation,
			});
		}

		const previousSetBalanceOnCredit = credit.amount;
		const toSetBalance = price.monthly_given_balance;

		// if new set balance is greater than the previous set balance
		// we need to calculate the difference between the new
		// and the prev, and add this diff to the balance
		if (toSetBalance.gt(previousSetBalanceOnCredit)) {
			const diff = toSetBalance.sub(previousSetBalanceOnCredit);

			await this.update(credit.id, {
				newBalance: credit.balance.add(diff),
				// Amount should be the total amount given by the plan
				newAmount: toSetBalance,
				reason: AccountCreditTransactionReason.PlanChange,
				reasonMetadata: undefined,
			});
		}
		// Else, because the user is downgrading the plan, and the last plan
		// is already paid, we just do nothing and only on the next
		// account date reset usage will be reset to the new plan value on balance and amount

		return credit;
	}

	async updateCreditGivenByPlanOnResetUsage(
		accountId: number,
		price: subscription_plan_price,
	) {
		const credit = await this.prisma.account_credit.findFirst({
			where: {
				account: accountId,
				is_given_by_plan: true,
			},
		});

		if (!credit) return;

		await this.update(credit.id, {
			newBalance: price.monthly_given_balance || new Prisma.Decimal(0),
			newAmount: price.monthly_given_balance || new Prisma.Decimal(0),
			reason: AccountCreditTransactionReason.PlanRenewal,
			reasonMetadata: undefined,
		});
	}

	async totalBalanceForAccount(accountId: number) {
		const allCredits = await this.prisma.account_credit.findMany({
			where: {
				account: accountId,
			},
			orderBy: {
				date_created: 'asc',
			},
		});

		const balance = allCredits.reduce((acc, curr) => {
			return acc.add(curr.balance);
		}, new Prisma.Decimal(0));

		return { balance, credits: allCredits };
	}

	async creditForAccount(
		accountId: number,
		{
			amount,
			reason,
			isGivenByPlan,
		}: {
			amount: Prisma.Decimal;
			reason: AccountCreditTransactionReason;
			isGivenByPlan?: boolean;
		},
	) {
		const credit = await this.prisma.account_credit.create({
			data: {
				id: v4(),
				account: accountId,
				balance: amount,
				amount,
				is_given_by_plan: isGivenByPlan,
			},
		});

		await this.prisma.account_credit_transaction.create({
			data: {
				id: v4(),
				amount,
				type: AccountCreditTransactionType.Credit,
				reason,
				credit: credit.id,
			},
		});

		return credit;
	}

	async update<Reason extends AccountCreditTransactionReason>(
		id: string,
		{
			newBalance,
			reason,
			newAmount,
		}: {
			newBalance: Prisma.Decimal;
			newAmount?: Prisma.Decimal;
		} & CreditTransactionInput<Reason>,
		trx?: Pick<(typeof PrismaService)['prototype'], Prisma.ModelName>,
	) {
		const p = trx || this.prisma;

		const previousCredit = await p.account_credit.findUniqueOrThrow({
			where: {
				id,
			},
		});

		const credit = await p.account_credit.update({
			where: {
				id,
			},
			data: {
				amount: newAmount,
				balance: newBalance,
			},
		});

		const diffInBalance = newBalance.sub(previousCredit.balance);

		const transactionType = diffInBalance.gte(0)
			? AccountCreditTransactionType.Credit
			: AccountCreditTransactionType.Debit;

		await p.account_credit_transaction.create({
			data: {
				id: v4(),
				amount: diffInBalance.abs(),
				type: transactionType,
				reason,
				credit: credit.id,
			},
		});
	}

	async debitForAccount(accountId: number, amount: Prisma.Decimal) {
		let transactionSuccess = false;
		while (!transactionSuccess) {
			try {
				transactionSuccess = true;

				await this.prisma.$transaction(
					async (trx) => {
						const credits = await trx.account_credit.findMany({
							where: {
								account: accountId,
							},
							orderBy: {
								date_created: 'asc',
							},
						});

						credits.sort((a) => {
							// The credit that are given by plan should come first
							return a.is_given_by_plan ? -1 : 1;
						});

						let remainingAmount = new Prisma.Decimal(amount);

						// Map all credits and try to debit the amount
						for (const credit of credits) {
							if (remainingAmount.lte(0)) break;

							const debitAmount = credit.balance.gte(remainingAmount)
								? remainingAmount
								: credit.balance;

							await this.update(
								credit.id,
								{
									newBalance: credit.balance.sub(debitAmount),
									reason: AccountCreditTransactionReason.ModuleUsage,
									reasonMetadata: {
										module: AccountUsageKind.flow,
									},
								},
								trx,
							);

							remainingAmount = remainingAmount.sub(debitAmount);
						}

						// If there is still remaining amount, create a new credit
						// with the remaining amount with a negative balance
						if (remainingAmount.gt(0)) {
							const createdNegative = await trx.account_credit.create({
								data: {
									id: v4(),
									account: accountId,
									balance: remainingAmount.mul(-1),
									amount: remainingAmount.mul(-1),
								},
							});
							// This can occur if the negative credit
							// was rounded to 0 because of the precision
							// at the database level, so we need to delete it
							if (createdNegative.balance.eq(0)) {
								await trx.account_credit.delete({
									where: {
										id: createdNegative.id,
									},
								});
							}
						}
					},
					{
						isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
					},
				);

				transactionSuccess = true;

				break;
			} catch (error) {
				if (error.code === 'P2034') {
					continue;
				}

				console.log(error);
				break;
			}
		}
	}
}
