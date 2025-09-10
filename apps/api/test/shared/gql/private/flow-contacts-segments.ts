import gql from 'graphql-tag';
import {
	FLOW_CONTACT_SEGMENT_FRAGMENT,
	FLOW_CONTACT_SEGMENT_WITH_METRICS,
} from './flow-contacts-segments-fragments';

export const CREATE_FLOW_CONTACT_SEGMENT = gql`
	mutation CreateFlowContactSegment($input: CreateFlowContactSegmentInput!) {
		createFlowContactSegment(input: $input) {
			...FlowContactSegment
		}
	}
	${FLOW_CONTACT_SEGMENT_FRAGMENT}
`;

export const ACCOUNT_FLOW_SEGMENTS = gql`
	query AccountFlowSegments($accountId: ID!) {
		accountFlowSegments(account: $accountId) {
			...FlowContactSegment
		}
	}
	${FLOW_CONTACT_SEGMENT_FRAGMENT}
`;

export const FLOW_SEGMENT = gql`
	query AccountFlowSegment($accountFlowSegmentId: ID!) {
		accountFlowSegment(id: $accountFlowSegmentId) {
			...FlowContactSegmentWithMetrics
		}
	}
	${FLOW_CONTACT_SEGMENT_WITH_METRICS}
`;

export const UPDATE_FLOW_SEGMENT = gql`
	mutation UpdateFlowContactSegment($input: UpdateFlowContactSegmentInput!) {
		updateFlowContactSegment(input: $input) {
			...FlowContactSegment
		}
	}
	${FLOW_CONTACT_SEGMENT_FRAGMENT}
`;

export const DELETE_FLOW_SEGMENT = gql`
	mutation DeleteFlowSegment($deleteFlowSegmentId: ID!) {
		deleteFlowSegment(id: $deleteFlowSegmentId)
	}
`;
