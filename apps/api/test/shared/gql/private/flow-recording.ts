import gql from 'graphql-tag';
import { FLOW_RECORDING_FRAGMENT } from './flow-recording-fragments';

export const FLOW_RECORDINGS = gql`
	query FlowRecordings(
		$pagination: PaginatedFlowRecordingListOptions
		$filter: FlowRecordingListFilter
		$accountId: ID!
	) {
		flowRecordings(pagination: $pagination, filter: $filter, accountId: $accountId) {
			items {
				...FlowRecording
			}
			totalItems
		}
	}
	${FLOW_RECORDING_FRAGMENT}
`;
