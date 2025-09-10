import { getApiClient } from '@/core/services/graphql/server';
import {
	QuotationByHashQuery,
	QuotationByHashQueryVariables,
} from '@/core/shared/api-gql-schema';
import { notFound } from 'next/navigation';
import { QUOTATION_BY_HASH } from './api-gql';

export const getQuotationByServer = async (hash: string) => {
	try {
		const { data } = await getApiClient().query<
			QuotationByHashQuery,
			QuotationByHashQueryVariables
		>({
			query: QUOTATION_BY_HASH,
			variables: {
				hash: hash,
			},
		});

		if (data.publicQuotation?.__typename === 'QuotationAvailabilityError') {
			return {
				error: data.publicQuotation,
			};
		}

		if (data.publicQuotation?.__typename === 'PublicQuotation') {
			return {
				data: data.publicQuotation,
			};
		}

		return notFound();
	} catch (e) {
		notFound();
	}
};
