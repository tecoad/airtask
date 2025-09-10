import PageContent from '@/components/page-content';
import 'moment/locale/pt-br';
import { useTranslations } from 'next-intl';
import { StepsByModule } from './components/steps-by-module';
import { Welcome } from './components/welcome';

export default function Page() {
	const t = useTranslations('meta');

	return (
		<>
			<title>{t('dashboard.title')}</title>

			<PageContent>
				<Welcome />

				<StepsByModule />
			</PageContent>
		</>
	);
}
