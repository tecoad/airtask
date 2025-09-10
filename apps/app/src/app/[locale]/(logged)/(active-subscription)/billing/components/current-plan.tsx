import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { PlanInterval, SubscriptionStatus } from '@/core/shared/gql-api-schema';
import { UnwrapPromise } from '@/core/types';
import { loadAccountSubscriptionData } from '@/lib/billing/server';
import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ManagePlan } from './manage-plan';

const Content = ({
	account,
	data,
}: UnwrapPromise<ReturnType<typeof loadAccountSubscriptionData>>) => {
	const t = useTranslations('billing');

	return (
		<Card>
			<CardHeader className="card-header">
				<CardTitle className="card-title subtle">{t('currentPlan')}</CardTitle>
				<Calendar size={22} strokeWidth={2} className="text-sky-500" />
			</CardHeader>
			<CardContent className="card-content">
				<div className="text-xl font-semibold">
					{`${data.plan} (${
						data.plan_interval === PlanInterval.Month
							? t('intervals.month')
							: t('intervals.year')
					})`}
				</div>
				{account.account.active_subscription?.status === SubscriptionStatus.Pending && (
					<Badge>{t('payment_failed')}</Badge>
				)}
			</CardContent>
			<CardFooter className="card-footer">
				<ManagePlan />
			</CardFooter>
		</Card>
	);
};

export const CurrentPlan = async () => {
	return <Content {...await loadAccountSubscriptionData()} />;
};
