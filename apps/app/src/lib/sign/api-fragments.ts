import { ACCOUNT_SEGMENT_FRAGMENT } from '@/lib/settings/api-fragments';
import { ONBOARDING_STEP_FRAGMENT } from '@/lib/user/api-fragments';
import { gql } from '@apollo/client';

export const USER_FRAGMENT = gql`
	fragment User on User {
		id
		email
		first_name
		last_name
	}
`;

export const ACCOUNT_FRAGMENT = gql`
	fragment Account on Account {
		id
		name
		segment {
			...Segment
		}
		description
		website
		currency
		active_subscription {
			id
			status
		}
		concluded_onboarding_steps {
			...OnBoardingStep
		}
	}
	${ONBOARDING_STEP_FRAGMENT}
	${ACCOUNT_SEGMENT_FRAGMENT}
`;

export const USER_ACCOUNT_FRAGMENT = gql`
	fragment UserAccount on UserAccount {
		role
		allowed_modules
		account {
			...Account
		}
	}
	${ACCOUNT_FRAGMENT}
`;

export const ACTIVE_USER_FRAGMENT = gql`
	fragment ActiveUser on ActiveUser {
		id
		email
		last_login
		is_affiliate
		first_name
		last_name
		anonymous_id
		permissions
		language
		accounts {
			...UserAccount
		}
	}
	${USER_ACCOUNT_FRAGMENT}
`;

export const MENU_USER_PERMISSIONS_FRAGMENT = gql`
	fragment MenuUserPermissions on ActiveUser {
		is_affiliate
		permissions
		accounts {
			role
			allowed_modules
			account {
				id
				currency
				active_subscription {
					status
				}
			}
		}
	}
`;
