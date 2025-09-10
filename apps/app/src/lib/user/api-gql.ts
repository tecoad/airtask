import { gql } from '@apollo/client';
import { ACTIVE_USER_FRAGMENT } from '../sign/api-fragments';
import { ONBOARDING_STEP_FRAGMENT } from './api-fragments';

export const REGISTER_ONBOARDING_STEP_FOR_ACCOUNT = gql`
	mutation RegisterOnboardingStepForAccount($accountId: ID!, $step: OnBoardingStepName!) {
		registerOnboardingStepForAccount(accountId: $accountId, step: $step) {
			...OnBoardingStep
		}
	}
	${ONBOARDING_STEP_FRAGMENT}
`;

export const UPDATE_USER = gql`
	mutation UpdateUser($input: UpdateUserInput!) {
		updateUser(input: $input) {
			...ActiveUser
			... on UserAuthError {
				errorCode
				message
			}
		}
	}
	${ACTIVE_USER_FRAGMENT}
`;
