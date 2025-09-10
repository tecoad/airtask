import { Title } from '@/components/title';
import { loadQuotationMetrics } from '@/lib/quotation/server-hooks';
import { useTranslations } from 'next-intl';

const Content = ({ title }: { title: string }) => {
	const t = useTranslations();

	return (
		<>
			<title>{t('meta.quotation.title', { title: title })}</title>
			<Title title={t('quotation.title', { title: title })} separator />
		</>
	);
};

export const QuotationTitle = async ({ id }: { id: string }) => {
	const data = await loadQuotationMetrics(id);

	return (
		<>
			<Content title={data.title} />
		</>
	);
};
