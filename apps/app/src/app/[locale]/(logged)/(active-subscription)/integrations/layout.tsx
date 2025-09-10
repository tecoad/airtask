import AsideContent from '@/components/aside-content';
import PageContent from '@/components/page-content';
import { useTranslations } from 'next-intl';

interface Props {
	children: React.ReactNode;
}

export default function SettingsLayout({ children }: Props) {
	const t = useTranslations('integrations');

	const sidebarNavItems = [
		{
			title: t('sidenav.settings'),
			href: 'settings',
		},
		{
			title: t('sidenav.api'),
			href: 'api',
		},
		{
			title: t('sidenav.webhooks'),
			href: 'webhooks',
		},
	];

	return (
		<>
			<PageContent
				heading={{
					title: t('title'),
					subtitle: t('subtitle'),
					separator: true,
				}}>
				<AsideContent items={sidebarNavItems}>{children}</AsideContent>
			</PageContent>
		</>
	);
}
