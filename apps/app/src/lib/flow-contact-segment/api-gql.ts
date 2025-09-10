import { gql } from '@apollo/client';
import {
	FLOW_CONTACT_SEGMENT_FRAGMENT,
	FLOW_CONTACT_SEGMENT_WITH_METRICS,
} from './api-fragments';

export const CREATE_FLOW_CONTACT_SEGMENT = gql`
	mutation CreateFlowContactSegment($input: CreateFlowContactSegmentInput!) {
		createFlowContactSegment(input: $input) {
			...FlowContactSegmentWithMetrics
		}
	}
	${FLOW_CONTACT_SEGMENT_WITH_METRICS}
`;

export const ACCOUNT_FLOW_SEGMENTS = gql`
	query AccountFlowSegments($accountId: ID!) {
		accountFlowSegments(account: $accountId) {
			...FlowContactSegment
		}
	}
	${FLOW_CONTACT_SEGMENT_FRAGMENT}
`;

export const ACCOUNT_FLOW_SEGMENTS_WITH_METRICS = gql`
	query AccountFlowSegmentsWithMetrics($accountId: ID!) {
		accountFlowSegments(account: $accountId) {
			...FlowContactSegmentWithMetrics
		}
	}
	${FLOW_CONTACT_SEGMENT_WITH_METRICS}
`;

export const FLOW_SEGMENT = gql`
	query AccountFlowSegment($accountFlowSegmentId: ID!) {
		accountFlowSegment(id: $accountFlowSegmentId) {
			...FlowContactSegment
		}
	}
	${FLOW_CONTACT_SEGMENT_FRAGMENT}
`;

export const UPDATE_FLOW_SEGMENT = gql`
	mutation UpdateFlowContactSegment($input: UpdateFlowContactSegmentInput!) {
		updateFlowContactSegment(input: $input) {
			...FlowContactSegmentWithMetrics
		}
	}
	${FLOW_CONTACT_SEGMENT_WITH_METRICS}
`;

export const DELETE_FLOW_SEGMENT = gql`
	mutation DeleteFlowSegment($deleteFlowSegmentId: ID!) {
		deleteFlowSegment(id: $deleteFlowSegmentId)
	}
`;
