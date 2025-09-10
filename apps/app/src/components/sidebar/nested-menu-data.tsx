import { useParseCookieValue } from '@/core/hooks/useParseCookieValue';
import { AccountUsageKind } from '@/core/shared/gql-api-schema';
import { useUser } from '@/lib';
import { CONSTANTS } from '@airtask/core/src/config';
import { useTranslations } from 'next-intl';
import React from 'react';
import { HeaderIcons } from '../header-icons';

export interface RawMenuItem {
	icon?: React.ReactNode;
	label: string;
	href?: string;
	gradient?: string;
	children?: (RawMenuItem | null)[];
	animateIn?: boolean;
}

export const RawMenuData = () => {
	const { user, isAccountAllowedToModule, isAccountSubscriptionActive } = useUser();
	const t = useTranslations('header');
	const enableAffiliateCookie = useParseCookieValue(CONSTANTS.COOKIES.enable_affiliate);

	const rawMenuData: (RawMenuItem | null)[] = [
		{
			icon: <HeaderIcons.dashboard />,
			label: t('menu.dashboard'),
			href: '/dashboard',
			gradient: 'to-sky-400 group-[.selected]:bg-blue-500',
		},
		{
			icon: <HeaderIcons.settings />,
			label: t('menu.accountSettings'),
			href: '/settings',
			gradient: 'to-indigo-400 group-[.selected]:bg-purple-500',
		},
		{
			icon: <HeaderIcons.modules />,
			label: t('menu.modules.label'),
			gradient: 'to-fuchsia-400 group-[.selected]:bg-pink-500',
			children: [
				isAccountSubscriptionActive() && isAccountAllowedToModule(AccountUsageKind.Flow)
					? {
							label: t('menu.modules.knowledgeBase'),
							href: '/modules/knowledge',
					  }
					: null,

				isAccountAllowedToModule(AccountUsageKind.Quotation)
					? {
							label: t('menu.modules.quotation'),
							href: '/modules/quotation',
					  }
					: null,
				isAccountAllowedToModule(AccountUsageKind.Flow)
					? {
							label: t('menu.modules.flow.label'),
							children: [
								{ label: t('menu.modules.flow.instances'), href: '/modules/flow' },
								{ label: t('menu.modules.flow.agents'), href: '/modules/flow/agents' },
								{
									label: t('menu.modules.flow.contacts'),
									href: '/modules/flow/contacts',
								},
								{
									label: t('menu.modules.flow.segments'),
									href: '/modules/flow/segments',
								},
								{
									label: t('menu.modules.flow.recordings'),
									href: '/modules/flow/recordings',
								},
							],
					  }
					: null,
			],
		},
		{
			icon: <HeaderIcons.bill />,
			label: t('menu.billing'),
			href: '/billing',
			gradient: 'to-pink-400 group-[.selected]:bg-purple-500',
		},
		{
			icon: <HeaderIcons.help />,
			label: t('menu.help'),
			href: '/help',
			gradient: 'to-blue-400 group-[.selected]:bg-purple-200',
		},
		{
			icon: <HeaderIcons.integrations />,
			label: t('menu.integrations'),
			href: '/integrations',
			gradient: 'to-yellow-300 group-[.selected]:bg-orange-500',
		},
		user?.is_affiliate || enableAffiliateCookie
			? {
					icon: <HeaderIcons.money />,
					animateIn: true,

					label: t('menu.affiliate'),
					href: '/affiliate',
					gradient: 'to-green-400 group-[.selected]:bg-cyan-500',
			  }
			: null,
	];

	return rawMenuData.filter(Boolean) as RawMenuItem[];
};
