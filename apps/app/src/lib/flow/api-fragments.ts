import { gql } from '@apollo/client';
import { FLOW_AGENT_FRAGMENT } from '../flow-agent/api-fragments';
import { FLOW_CONTACT_SEGMENT_FRAGMENT } from '../flow-contact-segment/api-fragments';

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
