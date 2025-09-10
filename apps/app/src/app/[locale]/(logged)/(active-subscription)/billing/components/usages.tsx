import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnwrapPromise } from '@/core/types';
import { loadAccountSubscriptionData } from '@/lib/billing/server';
import { TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

const Content = ({
	account,
	data,
}: UnwrapPromise<ReturnType<typeof loadAccountSubscriptionData>>) => {
	const t = useTranslations('billing');

	return (
		<Card>
			<CardHeader className="card-header">
				<CardTitle className="card-title">
					{`${t('usageThisMonth')}`}
					<Badge variant="secondary">
						{new Date(data.period_start).toLocaleDateString()} -{' '}
						{new Date(data.period_end).toLocaleDateString()}
					</Badge>
				</CardTitle>
				<TrendingUp size={22} strokeWidth={2} className="text-sky-500" />
			</CardHeader>
			<CardContent className="card-content ">
				<div className="flex w-full flex-col gap-6 ">
					{/* {data.usages.map((v, k) => (
						<Usage
							key={k}
							module={sanitizeName(v.module)}
							usage={v.usages}
							usageOf={v.maxUsages}
						/>
					))} */}
				</div>
			</CardContent>
		</Card>
	);
};

export const Usages = async () => {
	return <Content {...await loadAccountSubscriptionData()} />;
};
