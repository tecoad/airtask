import { gql } from '@apollo/client';

export const AFFILIATE_FRAGMENT = gql`
	fragment Affiliate on Affiliate {
		id
		status
		alias
		comission_duration_months
		comission_percentage
		payout_method
		payout_method_key
		date_created
		date_updated
	}
`;

export const AFFILIATE_COMISSION_FRAGMENT = gql`
	fragment AffiliateComission on AffiliateComission {
		id
		status
		date_payment
		amount
		date_created
	}
`;

export const AFFILIATE_COMISSION_CALCS_FRAGMENT = gql`
	fragment AffiliateComissionsCalcs on AffiliateComissionsCalcs {
		nextPaymentDate
		pendingAmountToReceive
		receivedLastMonth: paidAmountByPeriod(to: $to, from: $from)
		amountOfUsersIndicated
	}
`;
