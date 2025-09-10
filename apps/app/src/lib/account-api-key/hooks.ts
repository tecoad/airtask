import { apiClient } from '@/core';
import { EntityNameEventOption, useGlobalEvents } from '@/core/contexts/global-events';
import { useDataEventsObserver } from '@/core/hooks/useDataEventsObserver';
import {
	AccountApiKey,
	AccountApiKeysQuery,
	AccountApiKeysQueryVariables,
	CreateAccountApiKeyMutation,
	CreateAccountApiKeyMutationVariables,
	DeleteAccountApiKeyMutation,
	DeleteAccountApiKeyMutationVariables,
} from '@/core/shared/gql-api-schema';
import { useEffect, useState } from 'react';
import { useUser } from '../user';
import {
	ACCOUNT_API_KEYS,
	CREATE_ACCOUNT_API_KEY,
	DELETE_ACCOUNT_API_KEY,
} from './api-gql';

export const useListAccountApiKeys = () => {
	const { accountSelected } = useUser();
	const [data, setData] = useState<AccountApiKey[]>();
	const [isLoading, setLoading] = useState(true);

	const accountId = accountSelected?.account.id;
	useEffect(() => {
		if (!accountId) return;

		(async () => {
			setLoading(true);

			const { data } = await apiClient.query<
				AccountApiKeysQuery,
				AccountApiKeysQueryVariables
			>({
				query: ACCOUNT_API_KEYS,
				variables: {
					accountId,
				},
			});

			setData(data.accountApiKeys);
			setLoading(false);
		})();
	}, [accountId]);

	useDataEventsObserver(EntityNameEventOption.accountApiKey, setData);

	return { data, isLoading };
};

export const useCreateAccountApiKey = () => {
	const { accountSelected } = useUser();
	const { emit } = useGlobalEvents();
	const accountId = accountSelected?.account.id;

	return async (name?: string) => {
		if (!accountId) return;

		const { data } = await apiClient.mutate<
			CreateAccountApiKeyMutation,
			CreateAccountApiKeyMutationVariables
		>({
			mutation: CREATE_ACCOUNT_API_KEY,
			variables: {
				input: {
					accountId,
					name,
				},
			},
		});

		emit('entityCreated', {
			name: EntityNameEventOption.accountApiKey,
			data: data?.createAccountApiKey!,
		});

		return data?.createAccountApiKey;
	};
};

export const useDeleteAccountApiKey = () => {
	const { emit } = useGlobalEvents();
	const [isLoading, setLoading] = useState(false);

	const exec = async (id: string) => {
		setLoading(true);
		const { data } = await apiClient.mutate<
			DeleteAccountApiKeyMutation,
			DeleteAccountApiKeyMutationVariables
		>({
			mutation: DELETE_ACCOUNT_API_KEY,
			variables: {
				deleteAccountApiKeyId: id,
			},
		});
		setLoading(false);

		emit('entityDeleted', {
			name: EntityNameEventOption.accountApiKey,
			id,
		});

		return data?.deleteAccountApiKey;
	};

	return { exec, isLoading };
};
