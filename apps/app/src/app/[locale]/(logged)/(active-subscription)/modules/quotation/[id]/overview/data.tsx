import { loadQuotationMetrics } from '@/lib/quotation/server-hooks';

export const Data = async ({ id }: { id: string }) => {
	const data = await loadQuotationMetrics(id);

	return <div className={'text-2xl font-semibold'}>{data.requests_count}</div>;
};
