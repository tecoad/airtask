import { gql } from '@apollo/client';
import { ACCOUNT_API_KEY_FRAGMENT } from './api-fragments';

export const CREATE_ACCOUNT_API_KEY = gql`
	mutation CreateAccountApiKey($input: CreateAccountApiKeyInput) {
		createAccountApiKey(input: $input) {
			...AccountApiKey
		}
	}
	${ACCOUNT_API_KEY_FRAGMENT}
`;

export const DELETE_ACCOUNT_API_KEY = gql`
	mutation DeleteAccountApiKey($deleteAccountApiKeyId: ID!) {
		deleteAccountApiKey(id: $deleteAccountApiKeyId)
	}
`;

export const ACCOUNT_API_KEYS = gql`
	query AccountApiKeys($accountId: ID!) {
		accountApiKeys(accountId: $accountId) {
			...AccountApiKey
		}
	}
	${ACCOUNT_API_KEY_FRAGMENT}
`;
