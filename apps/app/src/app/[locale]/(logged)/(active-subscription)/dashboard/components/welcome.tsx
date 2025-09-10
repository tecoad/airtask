'use client';

import { Title } from '@/components/title';
import { useLocale, useTranslations } from 'next-intl';

import { useUser } from '@/lib';
import moment from 'moment';
import 'moment/locale/pt-br';

export function Welcome() {
	const { user, isUserLoading } = useUser();
	const t = useTranslations('dashboard');
	const locale = useLocale();

	return isUserLoading ? (
		<Title
			title="Welcome Skeleton"
			subtitle="Your last access was X/XX/XXXX, X:XX:XX PM (X minutes ago)."
			skeletonMode
		/>
	) : (
		<>
			<Title
				title={t('welcome', { firstname: user?.first_name })}
				subtitle={t('access', {
					time: `${new Date(user?.last_login).toLocaleString()} (${moment(
						new Date(user?.last_login),
					)
						.locale(locale)
						.fromNow()})`,
				})}
			/>
		</>
	);
}
