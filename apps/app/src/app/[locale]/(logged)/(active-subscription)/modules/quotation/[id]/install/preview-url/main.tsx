import { loadQuotationMetrics } from '@/lib/quotation/server-hooks';
import { PreviewUrlInteractions } from './interactions';

export const PreviewUrl = async ({ quotationId }: { quotationId: string }) => {
	const { hash } = await loadQuotationMetrics(quotationId);

	return <PreviewUrlInteractions hash={hash} />;
};
