import PageContent from '@/components/page-content';
import { useTranslations } from 'next-intl';
import QuotationSwitcher from './components/quotation-switcher';

interface SettingsLayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: SettingsLayoutProps) {
	const t = useTranslations('quotation');
	return (
		<PageContent topbar={{ content: <QuotationSwitcher />, title: t('quotation') }}>
			{children}
		</PageContent>
	);
}
