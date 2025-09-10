import { gql } from '@apollo/client';
import { PUBLIC_QUOTATION_FRAGMENT } from './public-fragments';

export const PUBLIC_QUOTATION = gql`
	query PublicQuotation($publicQuotationId: ID, $hash: String) {
		findPublicWithoutAvailabilityCheck(id: $publicQuotationId, hash: $hash) {
			...PublicQuotation
		}
	}
	${PUBLIC_QUOTATION_FRAGMENT}
`;
