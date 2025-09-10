import { gql } from '@apollo/client';

export const ACCOUNT_API_KEY_FRAGMENT = gql`
	fragment AccountApiKey on AccountApiKey {
		id
		name
		token
		maskedToken
		date_updated
		date_created
	}
`;
