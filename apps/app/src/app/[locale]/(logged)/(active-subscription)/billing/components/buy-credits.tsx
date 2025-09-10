'use client';
import { CustomButton } from '@/components/custom-button';
import { useCreateExtraCreditProductCheckout } from '@/lib';
import { useTranslations } from 'next-intl';

export const BuyCredits = () => {
	const t = useTranslations('billing');

	const { exec, isLoading } = useCreateExtraCreditProductCheckout();

	return (
		<CustomButton loading={isLoading} onClick={() => exec('')} className="w-full">
			{t('buyCredits')}
		</CustomButton>
	);
};
