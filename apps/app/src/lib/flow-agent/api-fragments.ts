import { gql } from '@apollo/client';
import { KNOWLEDGE_BASE_FRAGMENT } from '../knowledge/api-fragments';

export const FLOW_AGENT_FRAGMENT = gql`
	fragment FlowAgent on FlowAgent {
		id
		title
		script
		script_schema
		script_language
		voice
		editor_type
		knowledge_base {
			...KnowledgeBase
		}
		date_created
		date_updated
	}
	${KNOWLEDGE_BASE_FRAGMENT}
`;
