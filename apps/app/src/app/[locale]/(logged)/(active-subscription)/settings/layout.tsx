'use client';

import AsideContent from '@/components/aside-content';
import PageContent from '@/components/page-content';
import { AccountUsageKind } from '@/core/shared/gql-api-schema';
import { useUser } from '@/lib';
import { useTranslations } from 'next-intl';

interface Props {
	children: React.ReactNode;
}

export default function SettingsLayout({ children }: Props) {
	const { isAccountAllowedToModule } = useUser();
	const t = useTranslations('settings');

	let sidebarNavItems = [
		{
			title: t('sidenav.user'),
			href: 'user',
		},
	];

	if (isAccountAllowedToModule(AccountUsageKind.Quotation)) {
		sidebarNavItems.push({
			title: t('sidenav.widget'),
			href: 'widget',
		});
	}

	return (
		<>
			<PageContent
				heading={{ title: t('title'), subtitle: t('subtitle'), separator: true }}>
				<AsideContent items={sidebarNavItems}>{children}</AsideContent>
			</PageContent>
		</>
	);
}
