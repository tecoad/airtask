import { getApiClient } from '@/core/services/graphql/api/server';
import {
	AccountQuotationMetricsQuery,
	AccountQuotationMetricsQueryVariables,
} from '@/core/shared/gql-api-schema';
import { notFound } from 'next/navigation';
import { ACCOUNT_QUOTATION_METRICS } from './api-gql';

export const loadQuotationMetrics = async (id: string) => {
	try {
		const res = await getApiClient().query<
			AccountQuotationMetricsQuery,
			AccountQuotationMetricsQueryVariables
		>({
			query: ACCOUNT_QUOTATION_METRICS,
			variables: {
				accountQuotationId: id,
			},
		});

		if (!res.data.accountQuotation) notFound();

		return res.data.accountQuotation!;
	} catch (e) {
		notFound();
	}
};
