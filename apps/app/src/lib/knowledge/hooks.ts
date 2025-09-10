import { apiClient } from '@/core';
import { EntityNameEventOption, useGlobalEvents } from '@/core/contexts/global-events';
import { useDataEventsObserver } from '@/core/hooks/useDataEventsObserver';
import {
	AccountKnowledgeBasesQuery,
	AccountKnowledgeBasesQueryVariables,
	CreateKnowledgeBaseMutation,
	CreateKnowledgeBaseMutationVariables,
	CreateKnowledgeBaseQaInput,
	CreateKnowledgeBaseQaMutation,
	CreateKnowledgeBaseQaMutationVariables,
	DeleteKnowledgeBaseMutation,
	DeleteKnowledgeBaseMutationVariables,
	DeleteKnowledgeBaseQaMutation,
	DeleteKnowledgeBaseQaMutationVariables,
	KnowledgeBaseFragment,
	KnowledgeBaseType,
	UpdateKnowledgeBaseInput,
	UpdateKnowledgeBaseQaInput,
	UpdateKnowledgeBaseQaMutation,
	UpdateKnowledgeBaseQaMutationVariables,
	UpdateKnowledgeMutation,
	UpdateKnowledgeMutationVariables,
} from '@/core/shared/gql-api-schema';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '..';
import {
	ACCOUNT_KNOWLEDGE_BASES,
	CREATE_KNOWLEDGE_BASE,
	CREATE_KNOWLEDGE_BASE_QA,
	DELETE_KNOWLEDGE_BASE,
	DELETE_KNOWLEDGE_BASE_QA,
	UPDATE_KNOWLEDGE_BASE,
	UPDATE_KNOWLEDGE_BASE_QA,
} from './api-gql';

export const useListKnowledgeBases = () => {
	const { accountSelected } = useUser();
	const [isLoading, setLoading] = useState(true);
	const [data, setData] = useState<KnowledgeBaseFragment[]>();
	const { subscribe } = useGlobalEvents();

	const query = async () => {
		if (!accountSelected) return;

		setLoading(true);
		const { data } = await apiClient.query<
			AccountKnowledgeBasesQuery,
			AccountKnowledgeBasesQueryVariables
		>({
			query: ACCOUNT_KNOWLEDGE_BASES,
			fetchPolicy: 'no-cache',
			variables: {
				accountId: accountSelected.account.id,
			},
		});
		setData(data.accountKnowledgeBases);
		setLoading(false);
	};

	useDataEventsObserver(EntityNameEventOption.knowledgeBase, setData);

	useEffect(() => {
		query();
	}, [accountSelected?.account.id]);

	return {
		isLoading,
		data,
	};
};

export const useCreateKnowledgeBase = () => {
	const { accountSelected } = useUser();
	const { emit } = useGlobalEvents();

	const create = async (title: string) => {
		if (!accountSelected) return;

		const { data } = await apiClient.mutate<
			CreateKnowledgeBaseMutation,
			CreateKnowledgeBaseMutationVariables
		>({
			mutation: CREATE_KNOWLEDGE_BASE,
			variables: {
				accountId: accountSelected.account.id,
				input: {
					title,
					type: KnowledgeBaseType.Qa,
				},
			},
		});

		emit('entityCreated', {
			data: data?.createKnowledgeBase!,
			name: EntityNameEventOption.knowledgeBase,
		});

		return data?.createKnowledgeBase!;
	};

	return { create };
};

export const useCreateKnowledgeBaseQa = () => {
	const params = useParams();

	const create = async (input: CreateKnowledgeBaseQaInput) => {
		if (!input.knowledge_base_id.includes(params.id as string)) {
			input.knowledge_base_id.push(params.id as string);
		}

		const { data } = await apiClient.mutate<
			CreateKnowledgeBaseQaMutation,
			CreateKnowledgeBaseQaMutationVariables
		>({
			mutation: CREATE_KNOWLEDGE_BASE_QA,
			variables: {
				input,
			},
		});

		return data?.createKnowledgeBaseQA!;
	};

	return { create };
};

export const useUpdateKnowledgeBaseQa = () => {
	const update = async (input: UpdateKnowledgeBaseQaInput) => {
		const { data } = await apiClient.mutate<
			UpdateKnowledgeBaseQaMutation,
			UpdateKnowledgeBaseQaMutationVariables
		>({
			mutation: UPDATE_KNOWLEDGE_BASE_QA,
			variables: {
				input,
			},
		});

		return data?.updateKnowledgeBaseQA!;
	};

	return { update };
};

export const useDeleteKnowledge = () => {
	const [isLoading, setLoading] = useState(false);
	const { emit } = useGlobalEvents();

	const deleteKnowledge = async (id: string) => {
		try {
			setLoading(true);
			await apiClient.mutate<
				DeleteKnowledgeBaseMutation,
				DeleteKnowledgeBaseMutationVariables
			>({
				mutation: DELETE_KNOWLEDGE_BASE,
				variables: {
					deleteKnowledgeBaseId: id,
				},
			});

			emit('entityDeleted', {
				id,
				name: EntityNameEventOption.knowledgeBase,
			});
		} catch (e) {
			console.log(e);
		} finally {
			setLoading(false);
		}
	};

	return { isLoading, deleteKnowledge };
};
export const useDeleteKnowledgeBaseQa = () => {
	const [isLoading, setLoading] = useState(false);

	const exec = async (id: string) => {
		setLoading(true);
		const { data } = await apiClient.mutate<
			DeleteKnowledgeBaseQaMutation,
			DeleteKnowledgeBaseQaMutationVariables
		>({
			mutation: DELETE_KNOWLEDGE_BASE_QA,
			variables: {
				deleteKnowledgeBaseQaId: id,
			},
		});
		setLoading(false);
	};

	return { exec, isLoading };
};

export const useUpdateKnowledgeBase = () => {
	const{emit}=useGlobalEvents()
	const [isLoading, setLoading] = useState(false);

	const update = async (input: UpdateKnowledgeBaseInput) => {
		setLoading(true);
		const { data } = await apiClient.mutate<
			UpdateKnowledgeMutation,
			UpdateKnowledgeMutationVariables
		>({
			mutation: UPDATE_KNOWLEDGE_BASE,
			variables: {
				input,
			},
		});
		setLoading(false);

		emit('entityUpdated', {
			data: data?.updateKnowledge!,
			name: EntityNameEventOption.knowledgeBase,
		})

		return data?.updateKnowledge!;
	};

	return { update, isLoading };
};
