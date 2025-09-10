import gql from 'graphql-tag';

export const FLOW_CONTACT_SEGMENT_FRAGMENT = gql`
	fragment FlowContactSegment on FlowContactSegment {
		id
		label
	}
`;

export const FLOW_CONTACT_SEGMENT_WITH_METRICS = gql`
	fragment FlowContactSegmentWithMetrics on FlowContactSegment {
		id
		label
		flow_contacts_count
		flow_instances_count
	}
`;
