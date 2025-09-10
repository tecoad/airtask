'use client';

import { ManageQuotation } from '@/app/[locale]/(logged)/(active-subscription)/modules/quotation/components/manage-quotation/manage-quotation';
import { Title } from '@/components/title';
import { useTranslations } from 'next-intl';
import { notFound, useSearchParams } from 'next/navigation';

const CreateQuotation = () => {
	const query = useSearchParams();
	const title = query.get('title');
	const t = useTranslations('quotation');
	if (!title) return notFound();

	return (
		<>
			<Title
				title={t('instance.newInstance', { name: title })}
				subtitle={t('instance.newInstanceInstructions')}
			/>
			<ManageQuotation />
		</>
	);
};

export default CreateQuotation;
