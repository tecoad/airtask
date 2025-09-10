import { getApiClient } from '@/core/services/graphql/api/server';
import {
	AccountFlowAgentQuery,
	AccountFlowAgentQueryVariables,
} from '@/core/shared/gql-api-schema';
import { notFound } from 'next/navigation';
import { ACCOUNT_FLOW_AGENT } from './api-gql';

export const getFlowAgentFromServer = async (id: string) => {
	try {
		const { data } = await getApiClient().query<
			AccountFlowAgentQuery,
			AccountFlowAgentQueryVariables
		>({
			query: ACCOUNT_FLOW_AGENT,
			variables: {
				accountFlowAgentId: id,
			},
		});

		if (!data.accountFlowAgent) {
			notFound();
		}

		return data.accountFlowAgent!;
	} catch (e) {
		console.log(e);

		notFound();
	}
};
