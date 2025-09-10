import gql from 'graphql-tag';

export const KNOWLEDGE_BASE_QA_FRAGMENT = gql`
	fragment KnowledgeBaseQA on KnowledgeBaseQA {
		id
		question
		answer
		date_created
		date_updated
		knowledge_base {
			...KnowledgeBaseWithoutQa
		}
	}
`;

export const KNOWLEDGE_BASE_WITHOUT_QA_FRAGMENT = gql`
	fragment KnowledgeBaseWithoutQa on KnowledgeBase {
		id
		title
		type
		date_created
		date_updated
	}
`;

export const KNOWLEDGE_BASE_FRAGMENT = gql`
	fragment KnowledgeBase on KnowledgeBase {
		...KnowledgeBaseWithoutQa
		qa {
			...KnowledgeBaseQA
		}
	}
	${KNOWLEDGE_BASE_QA_FRAGMENT}
	${KNOWLEDGE_BASE_WITHOUT_QA_FRAGMENT}
`;

export const KNOWLEDGE_BASE_QA_WITH_BASES_FRAGMENT = gql`
	fragment KnowledgeBaseQAWithBases on KnowledgeBaseQA {
		...KnowledgeBaseQA
		knowledge_base {
			...KnowledgeBaseWithoutQa
		}
	}
	${KNOWLEDGE_BASE_QA_FRAGMENT}
	${KNOWLEDGE_BASE_WITHOUT_QA_FRAGMENT}
`;
