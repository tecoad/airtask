import { SectionTitle } from '@/components/section-title';
import { Suspense } from 'react';
import { Delete } from './components/delete';

export type Props = {
	params: { id: string };
};

import { useTranslations } from 'next-intl';
import { QuotationSettingsForm } from './components/quotation-settings-form';

export default function Page({ params }: Props) {
	const t = useTranslations('quotation.settings');

	return (
		<>
			<SectionTitle title={t('title')} subtitle={t('subtitle')} />

			<QuotationSettingsForm />

			<Suspense>
				<Delete quotationId={params.id} />
			</Suspense>
		</>
	);
}
