import { gql } from '@apollo/client';

export const FLOW_RECORDING_FRAGMENT = gql`
	fragment FlowRecording on FlowRecording {
		id
		record {
			url
		}
		duration
		flow {
			id
			name
			type
			date_updated
			date_created
			daily_budget
			status
		}
		contact_name
		contact_phone
		date_created
	}
`;
