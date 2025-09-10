import { ENV } from '@/core/config/env';
import { loadQuotationMetrics } from '@/lib/quotation/server-hooks';
import { WidgetLinkInteractions } from './interactions';

export const WidgetLink = async ({ quotationId }: { quotationId: string }) => {
	const { hash } = await loadQuotationMetrics(quotationId);

	const link = ENV.WIDGET.widget_url_by_hash(hash);
	return <WidgetLinkInteractions link={link} />;
};
