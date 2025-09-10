import { SectionTitle } from '@/components/section-title';
import { useTranslations } from 'next-intl';

export default function IntegrationSettingsPage() {
	const t = useTranslations('settings.user');
	return (
		<>
			<SectionTitle title={t('title')} subtitle={t('subtitle')} separator="bottom" />
			<div>asd</div>
		</>
	);
}
