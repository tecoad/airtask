'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { CustomButton } from './custom-button';

export const Button404 = () => {
	const router = useRouter();
	const t = useTranslations('404');

	return (
		<CustomButton
			variant="link"
			className="flex flex-row gap-2"
			onClick={() => router.back()}>
			<ArrowLeft size={16} strokeWidth={1.75} />
			{t('return')}
		</CustomButton>
	);
};
