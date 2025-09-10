import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/core';
import { unique } from '@/core/helpers/array';
import {
	AccountFlowsQuery,
	AccountFlowsQueryVariables,
	CreateFlowInput,
	CreateFlowMutation,
	CreateFlowMutationVariables,
	DeleteFlowMutation,
	DeleteFlowMutationVariables,
	FlowFragment,
	FlowStatus,
	FlowType,
	UpdateFlowInput,
	UpdateFlowMutation,
	UpdateFlowMutationVariables,
} from '@/core/shared/gql-api-schema';
import { Row } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import * as Yup from 'yup';
import { useUser } from '..';
import { ACCOUNT_FLOWS, CREATE_FLOW, DELETE_FLOW, UPDATE_FLOW } from './api-gql';

export const useListFlows = () => {
	const { accountSelected } = useUser();
	const t = useTranslations('flow.campaigns');
	const { toast } = useToast();
	const [isLoading, setLoading] = useState(true);
	const [data, setData] = useState<FlowFragment[]>();
	const [selected, setSelected] = useState<Row<FlowFragment>[]>([]);

	// const [filters, setFilters] = useState<Record<keyof FlowFragment, string | number>>({});
	const [filters, setFilters] = useState<Record<keyof FlowFragment, string | number>>(
		{} as Record<keyof FlowFragment, string | number>,
	);

	const setFilter = (key: keyof FlowFragment, value?: string) => {
		setFilters((prev) => {
			if (value === undefined) {
				const clone = { ...prev };

				delete clone[key];

				return clone;
			}

			return {
				...prev,
				[key]: value,
			};
		});
	};

	const updateSelectedItems = async (input: Omit<UpdateFlowInput, 'id'>) => {
		if (!accountSelected?.account.id) return;

		if (!selected.length) return;

		const toastInfo = toast({
			description: t('oneOrMoreItemsUpdating', {
				count: selected.length,
			}),
		});

		const updateResult = await Promise.all(
			selected.map(async ({ original: item }) => {
				const { data } = await apiClient.mutate<
					UpdateFlowMutation,
					UpdateFlowMutationVariables
				>({
					mutation: UPDATE_FLOW,
					variables: {
						input: {
							id: item.id,
							...input,
						},
					},
				});

				return data?.updateFlow!;
			}),
		);

		setSelected([]);

		setData((prev) => unique([...(prev || []), ...updateResult], 'id'));

		toastInfo.update({
			id: toastInfo.id,
			description: t('oneOrMoreItemsUpdated', {
				count: selected.length,
			}),
		});
	};

	const query = async () => {
		if (!accountSelected) return;

		setLoading(true);

		const { data } = await apiClient.query<AccountFlowsQuery, AccountFlowsQueryVariables>(
			{
				query: ACCOUNT_FLOWS,
				variables: {
					accountId: accountSelected.account.id,
				},
			},
		);

		setData(data.accountFlows);
		setLoading(false);
	};

	const removeItemFromList = (item: FlowFragment) => {
		setData((prev) => prev?.filter((v) => v.id !== item.id));
	};
	const updateItemAtList = (item: FlowFragment) => {
		setData((prev) => prev?.map((v) => (v.id === item.id ? item : v)));
	};
	const addToList = (item: FlowFragment) => {
		setData((prev) => [...(prev || []), item]);
	};

	useEffect(() => {
		query();
	}, [accountSelected?.account.id]);

	return {
		isLoading,
		data,
		removeItemFromList,
		updateItemAtList,
		addToList,
		selected,
		setSelected,

		filters,
		setFilter,

		updateSelectedItems,
	};
};

export type FlowFormValues = {
	name: string;
	type: FlowType;
	dailyBudget: number;
	status: FlowStatus;
	segmentId?: string;
	agentId: string;
};

const flowToFormValues = (flow: FlowFragment): FlowFormValues => ({
	name: flow.name,
	agentId: flow.agent.id,
	segmentId: flow.segment?.id,
	dailyBudget: flow.daily_budget,
	status: flow.status,
	type: flow.type,
});

export const useSetupFlowForm = () => {
	const t = useTranslations('flow.campaigns.errors');
	const defaultValues: Partial<FlowFormValues> = {
		status: FlowStatus.Active,
	};
	const schema = useMemo(() => {
		return Yup.object({
			name: Yup.string().required(t('required')),
			agentId: Yup.string().required(t('selectAAgent')),
			segmentId: Yup.string().when('type', {
				is: FlowType.Outbound,
				then: (v) => v.required(t('selectASegment')),
			}),
			dailyBudget: Yup.number().required(t('required')),
			status: Yup.string().required(t('required')),
			type: Yup.string().required(t('required')),
		});
	}, [t]);

	return { defaultValues, schema };
};

export const useFlowForm = ({
	item,
	isOpen,
	methods,
	onCreate,
	onUpdate,
}: {
	methods: UseFormReturn<FlowFormValues>;
	item?: FlowFragment;
	isOpen: boolean;
	onUpdate: (updatedItem: FlowFragment) => void;
	onCreate: (createdItem: FlowFragment) => void;
}) => {
	const { accountSelected } = useUser();
	const { defaultValues } = useSetupFlowForm();
	const resetFormFromData = () => {
		methods.reset(item ? flowToFormValues(item) : defaultValues);
	};

	useEffect(() => {
		resetFormFromData();
	}, [isOpen]);

	const onSubmit: SubmitHandler<FlowFormValues> = async (values) => {
		const updateInput = {
			name: values.name,
			agent: values.agentId,
			segment: values.segmentId,
			status: values.status,
			daily_budget: Number(values.dailyBudget),
		} satisfies Omit<UpdateFlowInput, 'id'>;

		const createInput = {
			...updateInput,
			type: values.type,
		} satisfies Omit<CreateFlowInput, 'account'>;

		if (item) {
			const { data } = await apiClient.mutate<
				UpdateFlowMutation,
				UpdateFlowMutationVariables
			>({
				mutation: UPDATE_FLOW,
				variables: {
					input: {
						id: item.id,
						...updateInput,
					},
				},
			});

			onUpdate(data?.updateFlow!);

			return;
		}

		const { data } = await apiClient.mutate<
			CreateFlowMutation,
			CreateFlowMutationVariables
		>({
			mutation: CREATE_FLOW,
			variables: {
				input: {
					account: accountSelected?.account.id!,
					...createInput,
				},
			},
		});

		onCreate(data?.createFlow!);
	};

	return { onSubmit };
};

export const useDeleteFlow = () => {
	const t = useTranslations('flow.campaigns');
	const { toast } = useToast();

	const deleteFlow = async (item: FlowFragment) => {
		const loadingToast = toast({
			title: t('deletingItem'),
		});

		await apiClient.mutate<DeleteFlowMutation, DeleteFlowMutationVariables>({
			mutation: DELETE_FLOW,
			variables: {
				deleteFlowId: item.id,
			},
		});

		loadingToast.update({
			id: loadingToast.id,
			title: t('itemSuccessfullyDeleted'),
			duration: 3000,
		});
	};

	return { deleteFlow };
};
