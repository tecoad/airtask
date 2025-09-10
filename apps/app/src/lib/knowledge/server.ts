import { getApiClient } from '@/core/services/graphql/api/server';
import {
	KnowledgeBaseQuery,
	KnowledgeBaseQueryVariables,
} from '@/core/shared/gql-api-schema';
import { notFound } from 'next/navigation';
import { KNOWLEDGE_BASE } from './api-gql';

export const getKnowledgeBase = async (id: string) => {
	try {
		const { data } = await getApiClient().query<
			KnowledgeBaseQuery,
			KnowledgeBaseQueryVariables
		>({
			query: KNOWLEDGE_BASE,
			variables: {
				knowledgeBaseId: id,
			},
		});

		if (!data.knowledgeBase) {
			notFound();
		}

		return data.knowledgeBase;
	} catch {
		notFound();
	}
};
