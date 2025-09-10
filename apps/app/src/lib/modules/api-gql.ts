import { gql } from '@apollo/client';
import { QUOTATION_EXHIBITION_FRAGMENT } from '../quotation/api-fragments';

export const GET_ACCOUNT_ALL_MODULES = gql`
	query AccountAllModules($account: ID!, $mode: SoftDeleteQueryMode!) {
		accountQuotations(account: $account, mode: $mode) {
			...QuotationExhibition
		}
	}
	${QUOTATION_EXHIBITION_FRAGMENT}
`;
