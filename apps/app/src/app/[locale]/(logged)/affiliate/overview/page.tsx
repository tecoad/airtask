'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAffiliateComissionsCalcs } from '@/lib';
import { Coins, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Page() {
	const { calcs, isLoading, lastMonthToThisComparsion } = useAffiliateComissionsCalcs();

	const t = useTranslations('affiliates.overview');
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card className="card">
				<CardHeader className="card-header">
					<CardTitle className="card-title subtle">
						{t('pendingToReceive')}
						{calcs?.nextPaymentDate && (
							<Badge className={`${isLoading ? 'is-skeleton' : ''}`} variant="outline">
								{t('nextPaymentAt', {
									date: new Date(calcs?.nextPaymentDate).toLocaleDateString(),
								})}
							</Badge>
						)}
					</CardTitle>
					<Coins size={20} strokeWidth={1.8} />
				</CardHeader>
				<CardContent className="card-content">
					<div className="flex flex-col gap-x-2 gap-y-0 md:flex-row md:items-center">
						<div className="text-2xl font-semibold">
							R$&nbsp;
							{calcs && calcs.pendingAmountToReceive
								? calcs?.pendingAmountToReceive.toFixed(2)
								: '0.00'}
						</div>
						{lastMonthToThisComparsion && (
							<div
								className={`text-muted-foreground flex flex-row gap-2 text-xs ${
									isLoading ? 'is-skeleton' : ''
								}`}>
								{lastMonthToThisComparsion?.isThisMonthHigher ? (
									<TrendingUp size={16} className="text-sky-500" strokeWidth={1.75} />
								) : (
									<TrendingDown size={16} className="text-red-500" strokeWidth={1.75} />
								)}
								{t('fromLastMonth', {
									value: `${
										lastMonthToThisComparsion?.isThisMonthHigher ? '+' : '-'
									} R$ ${lastMonthToThisComparsion?.diff.toFixed(2)}`,
								})}
							</div>
						)}
					</div>
				</CardContent>
			</Card>
			<Card className="card">
				<CardHeader className="card-header">
					<CardTitle className="card-title subtle">{t('totalAffiliates')}</CardTitle>
					<Users size={20} strokeWidth={1.8} />
				</CardHeader>
				<CardContent className="card-content">
					<div className="text-2xl font-semibold">
						{calcs && calcs.amountOfUsersIndicated ? calcs?.amountOfUsersIndicated : '0'}
					</div>
					{/* <p className="text-xs text-muted-foreground">
							{t("fromLastMonth", { percentage: "+20,18%" })}
						</p> */}
				</CardContent>
			</Card>
		</div>
	);
}
