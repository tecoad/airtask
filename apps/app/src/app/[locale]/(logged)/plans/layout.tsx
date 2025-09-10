import PageContent from '@/components/page-content';
import { useTranslations } from 'next-intl';

interface LayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	const t = useTranslations('plans');

	return (
		<PageContent
			heading={{
				title: t('title'),
				subtitle: t('subtitle'),
				separator: true,
			}}>
			{children}
		</PageContent>
	);
}
