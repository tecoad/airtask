import { gql } from '@apollo/client';
import { FLOW_RECORDING_FRAGMENT } from './api-fragments';

export const FLOW_RECORDINGS = gql`
	query FlowRecordings(
		$accountId: ID!
		$pagination: PaginatedFlowRecordingListOptions
		$filter: FlowRecordingListFilter
	) {
		flowRecordings(accountId: $accountId, pagination: $pagination, filter: $filter) {
			items {
				...FlowRecording
			}
			totalItems
		}
	}
	${FLOW_RECORDING_FRAGMENT}
`;
