import gql from 'graphql-tag';
import { FLOW_CONTACT_FRAGMENT } from './flow-contacts-fragments';

export const IMPORT_FLOW_CONTACTS_FROM_CSV = gql`
	mutation ImportFlowContactsFromCsv(
		$csv: Upload!
		$input: ImportFlowContactsFromCsvInput!
	) {
		importFlowContactsFromCsv(csv: $csv, input: $input) {
			... on ImportFlowContactsQueued {
				queued_items
				import_id
			}
			... on ImportFlowContactsError {
				errorCode
				message
			}
		}
	}
`;

export const PAGINATED_FLOW_CONTACTS = gql`
	query PaginatedFlowContacts(
		$accountId: ID!
		$pagination: PaginatedFlowContactListOptions
		$filter: FlowContactListFilter
	) {
		accountFlowContacts(accountId: $accountId, pagination: $pagination, filter: $filter) {
			items {
				...FlowContact
			}
			totalItems
		}
	}
	${FLOW_CONTACT_FRAGMENT}
`;

export const BATCH_UPDATE_FLOW_CONTACT = gql`
	mutation BatchUpdateFlowContact($input: [BatchUpdateFlowContact!]!) {
		batchUpdateFlowContact(input: $input) {
			...FlowContact
		}
	}
	${FLOW_CONTACT_FRAGMENT}
`;

export const TOGGLE_FLOW_CONTACT_IN_SEGMENT = gql`
	mutation ToggleFlowContactInSegment($input: ToggleFlowContactInSegmentInput) {
		toggleFlowContactInSegment(input: $input) {
			...FlowContact
		}
	}
	${FLOW_CONTACT_FRAGMENT}
`;
