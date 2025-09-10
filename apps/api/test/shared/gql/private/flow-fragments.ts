import gql from 'graphql-tag';
import { FLOW_AGENT_FRAGMENT } from './flow-agent-fragments';
import { FLOW_CONTACT_SEGMENT_FRAGMENT } from './flow-contacts-segments-fragments';

export const FLOW_FRAGMENT = gql`
	fragment Flow on Flow {
		id
		name
		segment {
			...FlowContactSegment
		}
		agent {
			...FlowAgent
		}
		type
		status
		daily_budget
	}
	${FLOW_CONTACT_SEGMENT_FRAGMENT}
	${FLOW_AGENT_FRAGMENT}
`;

export const SIMPLE_FLOW_FRAGMENT = gql`
	fragment SimpleFlow on Flow {
		id
		name
	}
`;
