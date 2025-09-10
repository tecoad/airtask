import { gql } from '@apollo/client';
import { ACTIVE_USER_FRAGMENT, MENU_USER_PERMISSIONS_FRAGMENT } from './api-fragments';

export const LOGIN_USER = gql`
	mutation LoginUser($input: LoginUserInput!) {
		loginUser(input: $input) {
			...ActiveUser
			... on UserAuthError {
				errorCode
				message
			}
		}
	}
	${ACTIVE_USER_FRAGMENT}
`;

export const ACTIVE_USER = gql`
	query ActiveUser {
		activeUser {
			...ActiveUser
		}
	}
	${ACTIVE_USER_FRAGMENT}
`;

export const MENU_USER_PERMISSIONS = gql`
	query MenuUserPermissions {
		activeUser {
			...MenuUserPermissions
		}
	}
	${MENU_USER_PERMISSIONS_FRAGMENT}
`;

export const REGISTER_USER = gql`
	mutation RegisterUser($input: RegisterUserInput!) {
		registerUser(input: $input) {
			... on UserRegistered {
				created_id
				should_verify_email
			}
			... on UserAuthError {
				errorCode
				message
			}
		}
	}
`;

export const LOGOUT_USER = gql`
	mutation LogoutUser {
		logoutUser
	}
`;

export const REQUEST_USER_EMAIL_VERIFICATION = gql`
	mutation RequestUserEmailVerification($requestUserEmailVerificationId: String!) {
		requestUserEmailVerification(id: $requestUserEmailVerificationId)
	}
`;

export const VERIFY_USER_EMAIL = gql`
	mutation VerifyUserEmail($verifyUserEmailId: String!, $token: String!) {
		verifyUserEmail(id: $verifyUserEmailId, token: $token) {
			... on VerifyUserEmailError {
				errorCode
				message
			}
			...ActiveUser
		}
	}
	${ACTIVE_USER_FRAGMENT}
`;

export const REQUEST_USER_PASSWORD_RESET = gql`
	mutation RequestUserPasswordReset($email: String!) {
		requestUserPasswordReset(email: $email)
	}
`;

export const RESET_USER_PASSWORD = gql`
	mutation ResetUserPassword($input: ResetUserPasswordInput!) {
		resetUserPassword(input: $input) {
			... on VerifyUserEmailError {
				errorCode
				message
			}
			...ActiveUser
		}
	}
	${ACTIVE_USER_FRAGMENT}
`;
