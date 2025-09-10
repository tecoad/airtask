import { SectionTitle } from '@/components/section-title';
import { useTranslations } from 'next-intl';
import { ManageQuotation } from '../../components/manage-quotation/manage-quotation';

export default function Page() {
	const t = useTranslations('quotation.edit');
	return (
		<>
			<SectionTitle title={t('editQuestions')} subtitle={t('subtitle')} />
			<ManageQuotation />
		</>
	);
}
