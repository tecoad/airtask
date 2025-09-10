import PageContent from '@/components/page-content';
import { useTranslations } from 'next-intl';

interface SettingsLayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: SettingsLayoutProps) {
	const t = useTranslations('flow.segments');
	return (
		<>
			<PageContent
				topbar={{
					title: t('title'),
					// content: <AgentSwitcher />,
				}}>
				{children}
			</PageContent>
		</>
	);
}
