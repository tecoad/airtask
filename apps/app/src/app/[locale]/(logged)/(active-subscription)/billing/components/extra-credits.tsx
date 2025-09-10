import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { formatCurrency } from '@/core/helpers/currency';
import { UnwrapPromise } from '@/core/types';
import { loadAccountSubscriptionData } from '@/lib/billing/server';
import { Wallet2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BuyCredits } from './buy-credits';

const Content = ({
	account,
	data,
}: UnwrapPromise<ReturnType<typeof loadAccountSubscriptionData>>) => {
	const t = useTranslations('billing');

	return (
		<>
			<Card>
				<CardHeader className="card-header">
					<CardTitle className="card-title subtle">{t('balance')}</CardTitle>
					<Wallet2 size={22} strokeWidth={2} className="text-sky-500" />
				</CardHeader>
				<CardContent className="card-content">
					<div className="text-xl font-semibold">
						{formatCurrency(account.account.currency!, data.credits)}
					</div>
				</CardContent>
				<CardFooter className="card-footer">
					<BuyCredits />
				</CardFooter>
			</Card>
		</>
	);
};

export const ExtraCredits = async () => {
	return <Content {...await loadAccountSubscriptionData()} />;
};
