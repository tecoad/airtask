import { SectionTitle } from '@/components/section-title';
import { useTranslations } from 'next-intl';
import { AffiliateForm } from './affiliate-form';

export default function SettingsAccountPage() {
	const t = useTranslations('affiliates.settings');
	return (
		<>
			<SectionTitle title={t('title')} subtitle={t('subtitle')} separator="bottom" />
			<AffiliateForm />
		</>
	);
}
