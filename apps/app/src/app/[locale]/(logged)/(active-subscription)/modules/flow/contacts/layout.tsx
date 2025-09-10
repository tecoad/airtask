import PageContent from '@/components/page-content';
import { useTranslations } from 'next-intl';

interface Props {
	children: React.ReactNode;
}

export default function SettingsLayout({ children }: Props) {
	const t = useTranslations('flow.contacts');

	return (
		<>
			<PageContent topbar={{ title: t('title') }}>{children}</PageContent>
		</>
	);
}
