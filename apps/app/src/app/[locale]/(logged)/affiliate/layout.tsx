import AsideContent from '@/components/aside-content';
import PageContent from '@/components/page-content';
import { useTranslations } from 'next-intl';

interface LayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	const t = useTranslations('affiliates');

	const sidebarNavItems = [
		{
			title: t('sidenav.overview'),
			href: 'overview',
		},
		{
			title: t('sidenav.settings'),
			href: 'settings',
		},
		{
			title: t('sidenav.comissions'),
			href: 'comissions',
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
