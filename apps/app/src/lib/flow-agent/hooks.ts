import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/core';
import { EntityNameEventOption, useGlobalEvents } from '@/core/contexts/global-events';
import { useDataEventsObserver } from '@/core/hooks/useDataEventsObserver';
import {
	AccountFlowAgentsQuery,
	AccountFlowAgentsQueryVariables,
	CreateDebugInteractionInput,
	CreateDebugInteractionMutation,
	CreateDebugInteractionMutationVariables,
	CreateFlowAgentInput,
	CreateFlowAgentMutation,
	CreateFlowAgentMutationVariables,
	DebugInteractionErrorCode,
	DeleteFlowAgentMutation,
	DeleteFlowAgentMutationVariables,
	FlowAgentEditorType,
	FlowAgentFragment,
	FlowAgentVoice,
	KnowledgeBaseFragment,
	UpdateFlowAgentMutation,
	UpdateFlowAgentMutationVariables,
} from '@/core/shared/gql-api-schema';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import * as Yup from 'yup';
import { useUser } from '..';
import {
	ACCOUNT_FLOW_AGENTS,
	CREATE_DEBUG_INTERACTION,
	CREATE_FLOW_AGENT,
	DELETE_FLOW_AGENT,
	UPDATE_FLOW_AGENT,
} from './api-gql';
import { LANGUAGES_CODES } from './data';

export const useCreateFlowAgent = () => {
	const { accountSelected } = useUser();
	const searchParams = useSearchParams();
	const { emit } = useGlobalEvents();

	const exec = async (input: Pick<CreateFlowAgentInput, 'editor_type'>) => {
		if (!accountSelected) return;

		const { data } = await apiClient.mutate<
			CreateFlowAgentMutation,
			CreateFlowAgentMutationVariables
		>({
			mutation: CREATE_FLOW_AGENT,
			variables: {
				input: {
					title: searchParams.get('title') as string,
					account: accountSelected.account.id,
					editor_type: input.editor_type,
					voice: FlowAgentVoice.Female,
				},
			},
		});

		emit('entityCreated', {
			data: data?.createFlowAgent!,
			name: EntityNameEventOption.agent,
		});

		return data!.createFlowAgent;
	};

	return { exec };
};

export const useListFlowAgents = () => {
	const { accountSelected } = useUser();
	const [isLoading, setLoading] = useState(true);
	const [data, setData] = useState<FlowAgentFragment[]>();
	const { subscribe } = useGlobalEvents();

	const query = async () => {
		if (!accountSelected) return;
		setLoading(true);

		const { data } = await apiClient.query<
			AccountFlowAgentsQuery,
			AccountFlowAgentsQueryVariables
		>({
			query: ACCOUNT_FLOW_AGENTS,
			variables: {
				account: accountSelected.account.id,
			},
			// remove this will break some effects that we need
			fetchPolicy: 'no-cache',
		});

		setData(data.accountFlowAgents);
		setLoading(false);
	};

	useDataEventsObserver(EntityNameEventOption.agent, setData);

	useEffect(() => {
		query();
	}, [accountSelected?.account.id]);

	return { isLoading, data };
};

const flowAgentGqlToForm = (data: FlowAgentFragment): FlowAgentFormValues => ({
	id: data.id,
	editor_type: data.editor_type,
	script: data.script,
	script_schema: data.script_schema,
	script_language: data.script_language,
	title: data.title,
	voice: data.voice,
	knowledge_base_id: data.knowledge_base?.id,

	_hydratedKnowledgeBase: data.knowledge_base,
});

export const useSetupFlowAgentForm = (data: FlowAgentFragment) => {
	const t = useTranslations('flow.agents.editor.errors');

	const schema = Yup.object({
		title: Yup.string().required(t('mandatory')),
		script: Yup.string(),
		editor_type: Yup.string().required(t('mandatory')),
		voice: Yup.string().required(t('mandatory')),
	});
	const defaultValues: Partial<FlowAgentFormValues> = flowAgentGqlToForm(data);

	return { schema, defaultValues };
};

export type FlowAgentFormValues = {
	id: string;
	title: string;
	script?: string | null;
	script_schema?: string | null;
	script_language?: string | null;
	editor_type: FlowAgentEditorType;
	voice: FlowAgentVoice;
	knowledge_base_id?: string;
	_hydratedKnowledgeBase?: KnowledgeBaseFragment | null;
};

export const useFlowAgentForm = (
	methods: UseFormReturn<FlowAgentFormValues>,
	initialData?: FlowAgentFragment,
) => {
	const [data, setData] = useState<FlowAgentFragment | undefined>(initialData);
	const { emit } = useGlobalEvents();

	const onSubmit: SubmitHandler<FlowAgentFormValues> = async (values) => {
		if (!values.script_language) {
			const { data } = await axios.post<{
				languageCode: string;
			}>('/api/modules/flow/agents/detect-language', {
				script: values.script!,
			});

			if (!LANGUAGES_CODES.find((item) => item.code === data.languageCode)) return;

			values.script_language = data.languageCode;
		}

		const { data } = await apiClient.mutate<
			UpdateFlowAgentMutation,
			UpdateFlowAgentMutationVariables
		>({
			mutation: UPDATE_FLOW_AGENT,
			variables: {
				input: {
					id: values.id,
					title: values.title,
					editor_type: values.editor_type,
					script: values.script,
					script_schema: values.script_schema,
					script_language: values.script_language,
					voice: values.voice,
					knowledge_base: values.knowledge_base_id,
				},
			},
		});

		emit('entityUpdated', {
			data: data?.updateFlowAgent!,
			name: EntityNameEventOption.agent,
		});

		setData(data?.updateFlowAgent!);
		resetFormFromData(data?.updateFlowAgent!);
	};

	const resetFormFromData = (data: FlowAgentFragment) => {
		methods.reset(flowAgentGqlToForm(data));
	};

	useEffect(() => {
		initialData && resetFormFromData(initialData);
	}, [initialData]);

	return {
		data,
		onSubmit,
	};
};

export const useDebugTalkToAgent = () => {
	const [isLoading, setLoading] = useState(false);
	const t = useTranslations('flow.agents.talkToAgent');
	const { toast } = useToast();

	const talk = async (input: Omit<CreateDebugInteractionInput, 'debugAsInbound'>) => {
		setLoading(true);

		const { data } = await apiClient.mutate<
			CreateDebugInteractionMutation,
			CreateDebugInteractionMutationVariables
		>({
			mutation: CREATE_DEBUG_INTERACTION,
			variables: {
				input: {
					...input,
					debugAsInbound: false,
				},
			},
		});

		switch (data?.createDebugInteraction.__typename) {
			case 'DebugInteractionCreated': {
				toast({
					description: t('createDebugInteractionSuccess'),
				});
				break;
			}
			case 'DebugInteractionError': {
				switch (data.createDebugInteraction.errorCode) {
					case DebugInteractionErrorCode.InsufficientFunds: {
						toast({
							description: t('insufficientFunds'),
						});
						break;
					}
				}
				break;
			}
		}

		setLoading(false);
	};

	return { talk, isLoading };
};

export const useDeleteFlowAgent = () => {
	const { emit } = useGlobalEvents();
	const [isLoading, setLoading] = useState(false);
	const exec = async (id: string) => {
		setLoading(true);
		await apiClient.mutate<DeleteFlowAgentMutation, DeleteFlowAgentMutationVariables>({
			mutation: DELETE_FLOW_AGENT,
			variables: {
				deleteFlowAgentId: id,
			},
		});
		emit('entityDeleted', {
			id,
			name: EntityNameEventOption.agent,
		});
		setLoading(false);
	};

	return { exec, isLoading };
};
