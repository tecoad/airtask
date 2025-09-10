import { CustomButton } from '@/components/custom-button';
import { Badge } from '@/components/ui/badge';
import { ENV } from '@/core/config/env';
import { PlanInterval } from '@/core/shared/gql-api-schema';
import { useCreateSubscriptionCheckout } from '@/lib/plans/hooks';
import { useTranslations } from 'next-intl';
import { HTMLAttributes } from 'react';

export type PricingCardData = {
	name: string;
	description: string;
	price: number;
	amountSaved?: number;
	duration: PlanInterval;
	currency: string;
	benefits?: string[];
	external_id: string;
};

interface PricingCardProps {
	ui: Partial<HTMLAttributes<HTMLDivElement>>;
	data: PricingCardData;
}

export const PricingCard = (props: PricingCardProps) => {
	const { data, ui, ...rest } = props;
	const { className, ...divRest } = ui;
	const { name, description, price, currency, amountSaved, duration, benefits } = data;
	const isFree = price == 0;

	const { exec, isLoading } = useCreateSubscriptionCheckout();

	const formatPrice = (price: number) => {
		const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency });
		return formatter.format(price);
	};

	const t = useTranslations('plans');

	return (
		<div className={`relative flex flex-col rounded-lg p-6 ${className}`} {...divRest}>
			<div className="flex-1">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="text-2xl">{name}</div>

					{!isFree && (
						<Badge className="whitespace-nowrap">
							{duration === PlanInterval.Month
								? t('billedMonthly')
								: t('save', {
										value: formatPrice(amountSaved!),
								  })}
						</Badge>
					)}
				</div>

				<div className="my-4 flex flex-row items-center gap-4">
					<div className="flex-shrink-0 text-3xl">{formatPrice(price)}</div>
					{!isFree && (
						<>
							<div className="bg-foreground h-10 w-[2px] rotate-12 opacity-50" />

							<div className="text-lg leading-none">
								{t.rich('perDuration', {
									duration: duration === PlanInterval.Month ? t('month') : t('year'),
									br: () => <br />,
								})}
							</div>
						</>
					)}
				</div>

				<div className="mt-6">
					<div className="mb-6 text-xl font-semibold">{description}</div>
					<ul>{benefits?.map((item, index) => <li key={index}>{item}</li>)}</ul>
				</div>
			</div>
			<div className="mt-6">
				<CustomButton
					loading={isLoading}
					className="flex w-full flex-row gap-2"
					onClick={() => exec(data)}>
					{ENV.PLANS.is_using_trial ? t('startTrial') : t('selectPlan')}
				</CustomButton>
			</div>
		</div>
	);
};
