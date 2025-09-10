import { loadQuotationMetrics } from '@/lib/quotation/server-hooks';
import { DeleteQuotationForm } from './delete-quotation-form';

export const Delete = async ({ quotationId }: { quotationId: string }) => {
	const quotation = await loadQuotationMetrics(quotationId);

	return <DeleteQuotationForm quotation={quotation} />;
};
