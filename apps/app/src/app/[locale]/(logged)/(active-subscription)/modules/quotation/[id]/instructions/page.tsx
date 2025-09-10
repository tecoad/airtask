import { SectionTitle } from '@/components/section-title';
import { useTranslations } from 'next-intl';
import { InstructionsForm } from './components/instructions-form';

export default function Page() {
	const t = useTranslations('quotation.instructions');
	return (
		<>
			<SectionTitle title={t('title')} subtitle={t('subtitle')} />
			<InstructionsForm />
		</>
	);
}
