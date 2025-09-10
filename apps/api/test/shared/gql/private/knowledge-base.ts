import gql from 'graphql-tag';
import {
	KNOWLEDGE_BASE_FRAGMENT,
	KNOWLEDGE_BASE_QA_WITH_BASES_FRAGMENT,
} from './knowledge-base-fragments';

export const CREATE_KNOWLEDGE_BASE = gql`
	mutation CreateKnowledgeBase($accountId: ID!, $input: CreateKnowledgeBaseInput!) {
		createKnowledgeBase(accountId: $accountId, input: $input) {
			...KnowledgeBase
		}
	}
	${KNOWLEDGE_BASE_FRAGMENT}
`;

export const KNOWLEDGE_BASE = gql`
	query KnowledgeBase($knowledgeBaseId: ID!) {
		knowledgeBase(id: $knowledgeBaseId) {
			...KnowledgeBase
		}
	}
	${KNOWLEDGE_BASE_FRAGMENT}
`;

export const DELETE_KNOWLEDGE_BASE = gql`
	mutation DeleteKnowledgeBase($deleteKnowledgeBaseId: ID!) {
		deleteKnowledgeBase(id: $deleteKnowledgeBaseId)
	}
`;

export const ACCOUNT_KNOWLEDGE_BASES = gql`
	query AccountKnowledgeBases($accountId: ID!) {
		accountKnowledgeBases(accountId: $accountId) {
			...KnowledgeBase
		}
	}
	${KNOWLEDGE_BASE_FRAGMENT}
`;

export const UPDATE_KNOWLEDGE_BASE = gql`
	mutation UpdateKnowledge($input: UpdateKnowledgeBaseInput!) {
		updateKnowledge(input: $input) {
			...KnowledgeBase
		}
	}
	${KNOWLEDGE_BASE_FRAGMENT}
`;

/**QA */

export const CREATE_KNOWLEDGE_BASE_QA = gql`
	mutation CreateKnowledgeBaseQA($input: [CreateKnowledgeBaseQAInput!]!) {
		createKnowledgeBaseQA(input: $input) {
			...KnowledgeBaseQAWithBases
		}
	}
	${KNOWLEDGE_BASE_QA_WITH_BASES_FRAGMENT}
`;
export const DELETE_KNOWLEDGE_BASE_QA = gql`
	mutation DeleteKnowledgeBaseQA($deleteKnowledgeBaseQaId: [ID!]!) {
		deleteKnowledgeBaseQA(id: $deleteKnowledgeBaseQaId)
	}
`;

export const UPDATE_KNOWLEDGE_BASE_QA = gql`
	mutation UpdateKnowledgeBaseQA($input: UpdateKnowledgeBaseQAInput!) {
		updateKnowledgeBaseQA(input: $input) {
			...KnowledgeBaseQAWithBases
		}
	}
	${KNOWLEDGE_BASE_QA_WITH_BASES_FRAGMENT}
`;

export const KNOWLEDGE_BASE_QA = gql`
	query KnowledgeBaseQA($knowledgeBaseQaId: ID!) {
		knowledgeBaseQA(id: $knowledgeBaseQaId) {
			...KnowledgeBaseQAWithBases
		}
	}
	${KNOWLEDGE_BASE_QA_WITH_BASES_FRAGMENT}
`;
