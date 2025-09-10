import gql from 'graphql-tag';
import { ASSET_FRAGMENT } from '../shared/settings-fragments';
import { SIMPLE_FLOW_FRAGMENT } from './flow-fragments';

export const FLOW_RECORDING_FRAGMENT = gql`
	fragment FlowRecording on FlowRecording {
		id
		contact_name
		contact_phone
		duration
		flow {
			...SimpleFlow
		}
		record {
			...Asset
		}
		date_created
	}
	${SIMPLE_FLOW_FRAGMENT}
	${ASSET_FRAGMENT}
`;
