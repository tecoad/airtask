import { gql } from '@apollo/client';
import {
	AFFILIATE_COMISSION_CALCS_FRAGMENT,
	AFFILIATE_COMISSION_FRAGMENT,
	AFFILIATE_FRAGMENT,
} from './api-fragments';

export const ACTIVE_USER_AFFILIATE = gql`
	query ActiveUserAffiliate {
		activeUserAffiliate {
			...Affiliate
		}
	}
	${AFFILIATE_FRAGMENT}
`;

export const CREATE_USER_AFFILIATE = gql`
	mutation CreateAffiliateForUser($input: CreateUserAffiliateInput!) {
		createAffiliateForUser(input: $input) {
			...Affiliate
			... on AffiliateSettingsResultError {
				errorCode
				message
			}
		}
	}
	${AFFILIATE_FRAGMENT}
`;

export const UPDATE_USER_AFFILIATE = gql`
	mutation UpdateUserAffiliate($input: UpdateUserAffiliateInput!) {
		updateUserAffiliate(input: $input) {
			...Affiliate
			... on AffiliateSettingsResultError {
				errorCode
				message
			}
		}
	}
	${AFFILIATE_FRAGMENT}
`;

export const IS_AFFILIATE_ALIAS_AVAILABLE = gql`
	query IsAffiliateAliasAvailable($alias: String!) {
		isAffiliateAliasAvailable(alias: $alias)
	}
`;

export const AFFILIATE_COMISSIONS_CALCS = gql`
	query AffiliateComissionsCalcs($to: DateTime, $from: DateTime) {
		affiliateComissionsCalcs {
			...AffiliateComissionsCalcs
		}
		activeUserAffiliate {
			...Affiliate
		}
	}
	${AFFILIATE_FRAGMENT}
	${AFFILIATE_COMISSION_CALCS_FRAGMENT}
`;

export const AFFILIATE_COMISSIONS = gql`
	query AffiliateComission(
		$pagination: PaginatedAffiliateComissionListOptions
		$filter: AffiliateComissionsListFilter
	) {
		affiliateComissions(pagination: $pagination, filter: $filter) {
			items {
				...AffiliateComission
			}
			totalItems
		}
	}
	${AFFILIATE_COMISSION_FRAGMENT}
`;
