import gql from 'graphql-tag';
import { KNOWLEDGE_BASE_WITHOUT_QA_FRAGMENT } from './knowledge-base-fragments';

export const FLOW_AGENT_FRAGMENT = gql`
	fragment FlowAgent on FlowAgent {
		id
		title
		script
		script_schema
		voice
		editor_type
		knowledge_base {
			...KnowledgeBaseWithoutQa
		}
		date_created
		date_updated
	}
	${KNOWLEDGE_BASE_WITHOUT_QA_FRAGMENT}
`;
