'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { gqlLanguageCodeToI18n } from '@/core/helpers/gql-language-code-to-i18n';
import {
	CurrencyCode,
	PlanInterval,
	SubscriptionPlanFragment,
	SubscriptionPlanPriceFragment,
} from '@/core/shared/gql-api-schema';
import { useLocale, useTranslations } from 'next-intl';
import { PlansTables } from './plans-table';

import { SelectField } from '@/components/forms/select';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/lib';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export const Tables = ({ plans }: { plans: SubscriptionPlanFragment[] }) => {
	const language = useLocale();
	const t = useTranslations('plans');
	const { accountSelected, isUserLoading } = useUser();
	const methods = useForm<{
		duration: PlanInterval;
		currency: CurrencyCode;
	}>({
		defaultValues: {
			currency: plans[0].prices[0].currency as CurrencyCode,
			duration: PlanInterval.Month,
		},
	});
	const { watch, setValue, control } = methods;
	const [currency, duration] = watch(['currency', 'duration']);

	const availableCurrency = Object.keys(
		plans.reduce(
			(acc, value) => {
				for (const price of value.prices) {
					acc[price.currency] = acc[price.currency] || [];

					acc[price.currency].push(price);
				}

				return acc;
			},
			{} as Record<CurrencyCode, SubscriptionPlanPriceFragment[]>,
		),
	) as CurrencyCode[];

	useEffect(() => {
		setValue('currency', accountSelected?.account.currency || availableCurrency[0]);
	}, [accountSelected?.account.currency]);

	return (
		<Form {...methods}>
			<div className="flex justify-center">
				<div className="bg-background flex flex-row items-center justify-center gap-6 rounded-md  border px-3 py-2">
					{/* PERIOD */}
					<div className="flex items-center justify-center space-x-2 ">
						<Label
							htmlFor="annual"
							className={`text-base font-semibold transition-colors ${
								duration == PlanInterval.Month && 'text-foreground'
							}`}>
							{t('monthly')}
						</Label>
						<Switch
							id="annual"
							onCheckedChange={(v) =>
								setValue('duration', v ? PlanInterval.Year : PlanInterval.Month)
							}
						/>
						<Label
							htmlFor="annual"
							className={`text-base font-semibold transition-colors ${
								duration == PlanInterval.Year && 'text-foreground'
							}`}>
							{t('annual')}
						</Label>
					</div>

					{/* CURRENCY */}
					{!isUserLoading && !accountSelected?.account.currency && (
						<>
							<Separator orientation="vertical" className="h-8" />

							<div className="flex flex-row items-center gap-3">
								<div className="text-foreground text-sm font-semibold">
									{t('selectCurrency')}{' '}
								</div>
								<SelectField
									className="w-[100px]"
									items={availableCurrency.map((v) => ({
										label: v,
										value: v,
									}))}
									control={control}
									name="currency"
									placeholder={t('selectCurrencyPlaceholder')}
								/>
							</div>
						</>
					)}
				</div>
			</div>

			<PlansTables
				plans={plans.flatMap((v) => {
					const price = v.prices.find(
						(item) => item.interval === duration && item.currency === currency,
					);
					const thisPriceAtMonthly = v.prices.find(
						(item) =>
							item.currency === price?.currency && item.interval === PlanInterval.Month,
					);

					const yearPriceByMonth = Number(price?.price) / 12;

					const benefits =
						v.benefits?.find(
							(item) => gqlLanguageCodeToI18n[item?.language!] === language,
						) || v.benefits?.[0];

					if (!price) return [];

					return {
						name: v.name,
						benefits: benefits?.value.split('\n'),
						description: '',
						currency: price?.currency!,
						duration: price?.interval!,
						price: Number(price?.price),
						amountSaved: (Number(thisPriceAtMonthly?.price) - yearPriceByMonth) * 12,
						external_id: price?.external_id!,
					};
				})}
			/>
		</Form>
	);
};
