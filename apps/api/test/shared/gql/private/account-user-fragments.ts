import gql from 'graphql-tag';

export const USER_FRAGMENT = gql`
	fragment User on User {
		id
		email
		first_name
		last_name
	}
`;

export const USER_ACCOUNT_WITHOUT_ACCOUNT_FRAGMENT = gql`
	fragment UserAccountWithoutAccount on UserAccount {
		user_id
		account_id
		role
		user {
			...User
		}
	}
	${USER_FRAGMENT}
`;

export const ONBOARDING_STEP_FRAGMENT = gql`
	fragment OnBoardingStep on OnBoardingStep {
		id
		name
		module
		date_created
	}
`;

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

export const ACCOUNT_FRAGMENT = gql`
	fragment Account on Account {
		id
		name
		segment {
			...Segment
		}
		website
		description
		currency
		users {
			...UserAccountWithoutAccount
		}
		concluded_onboarding_steps {
			...OnBoardingStep
		}
	}
	${USER_ACCOUNT_WITHOUT_ACCOUNT_FRAGMENT}
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

export const ACTIVE_USER_AND_ACCOUNTS_FRAGMENT = gql`
	fragment UserAndAccounts on ActiveUser {
		id
		email
		first_name
		last_name
		last_login
		is_affiliate
		language
		accounts {
			...UserAccount
		}
	}
	${USER_ACCOUNT_FRAGMENT}
`;

export const ACCOUNT_SETTINGS_FRAGMENT = gql`
	fragment AccountSettings on Account {
		id
		name
		segment {
			...Segment
		}
		website
		description
	}
	${ACCOUNT_SEGMENT_FRAGMENT}
`;
