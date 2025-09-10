import PageContent from '@/components/page-content';
import { useTranslations } from 'next-intl';
import KnowledgeSwitcher from './components/knowledge-switcher';

interface SettingsLayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: SettingsLayoutProps) {
	const t = useTranslations('modules.knowledge');
	return (
		<PageContent topbar={{ content: <KnowledgeSwitcher />, title: t('title') }}>
			{children}
		</PageContent>
	);
}
