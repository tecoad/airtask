import gql from 'graphql-tag';

export const FLOW_CONTACT_FRAGMENT = gql`
	fragment FlowContact on FlowContact {
		id
		first_name
		last_name
		email
		phone
		status
		segments {
			id
			label
		}
		date_updated
		date_created
	}
`;
