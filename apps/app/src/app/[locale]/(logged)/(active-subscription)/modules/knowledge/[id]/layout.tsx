import AsideContent from '@/components/aside-content';
import { useTranslations } from 'next-intl';

interface Props {
	children: React.ReactNode;
}

export default function SettingsLayout({ children }: Props) {
	const t = useTranslations('flow.knowledge');

	const sidebarNavItems = [
		{
			title: t('sidenav.qa'),
			href: 'edit',
		},
		{
			title: t('sidenav.settings'),
			href: 'settings',
		},
	];

	return (
		<AsideContent fullWidth items={sidebarNavItems}>
			{children}
		</AsideContent>
	);
}
