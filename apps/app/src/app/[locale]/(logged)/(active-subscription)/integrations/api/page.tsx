import { SectionTitle } from '@/components/section-title';
import { useTranslations } from 'next-intl';
import { CreateApiKey } from './components/create-api-key';
import { ListApiKeys } from './components/list-api-keys';

export default function IntegrationApiPage() {
	const t = useTranslations('settings.user');
	return (
		<>
			<SectionTitle title={t('title')} subtitle={t('subtitle')} separator="bottom" />
			<ListApiKeys />
			<CreateApiKey/>
		</>
	);
}
