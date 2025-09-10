import { gql } from '@apollo/client';

export const USER_FOR_ADMIN_FRAGMENT = gql`
	fragment UserForAdmin on User {
		id
		email
		first_name
		last_login
		last_name
		anonymous_id
		date_created
		date_updated
	}
`;
