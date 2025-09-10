'use client';

import { CustomButton } from '@/components/custom-button';
import { useSubscriptionPortal } from '@/lib';
import { useTranslations } from 'next-intl';

export const ManagePlan = () => {
	const t = useTranslations('billing');
	const { exec, isLoading } = useSubscriptionPortal();
	return (
		<CustomButton className="w-full" onClick={exec} loading={isLoading}>
			{t('administratePlan')}
		</CustomButton>
	);
};
