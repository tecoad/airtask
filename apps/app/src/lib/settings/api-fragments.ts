import { gql } from '@apollo/client';

export const ACCOUNT_SEGMENT_FRAGMENT = gql`
	fragment Segment on Segment {
		id
		title
		translations {
			language
			value
		}
	}
`;
