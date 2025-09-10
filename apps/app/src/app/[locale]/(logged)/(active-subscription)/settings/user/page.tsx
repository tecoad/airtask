import { SectionTitle } from '@/components/section-title';
import { useTranslations } from 'next-intl';
import { ProfileForm } from './user-form';

export default function SettingsProfilePage() {
	const t = useTranslations('settings.user');
	return (
		<>
			<SectionTitle title={t('title')} subtitle={t('subtitle')} separator="bottom" />

			<ProfileForm />
		</>
	);
}
