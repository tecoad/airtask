import PageContent from '@/components/page-content';
import { useTranslations } from 'next-intl';
import AgentSwitcher from './components/agent-switcher';

interface SettingsLayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: SettingsLayoutProps) {
	const t = useTranslations('flow.agents');
	return (
		<>
			<PageContent
				topbar={{
					title: t('title'),
					content: <AgentSwitcher />,
				}}>
				{children}
			</PageContent>
		</>
	);
}
