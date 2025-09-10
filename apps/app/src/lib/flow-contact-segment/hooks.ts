import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/core';
import {
	AccountFlowSegmentsQuery,
	AccountFlowSegmentsQueryVariables,
	AccountFlowSegmentsWithMetricsQuery,
	AccountFlowSegmentsWithMetricsQueryVariables,
	CreateFlowContactSegmentInput,
	CreateFlowContactSegmentMutation,
	CreateFlowContactSegmentMutationVariables,
	DeleteFlowSegmentMutation,
	DeleteFlowSegmentMutationVariables,
	FlowContactSegmentFragment,
	FlowContactSegmentWithMetricsFragment,
	UpdateFlowContactSegmentInput,
	UpdateFlowContactSegmentMutation,
	UpdateFlowContactSegmentMutationVariables,
} from '@/core/shared/gql-api-schema';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useUser } from '..';
import {
	ACCOUNT_FLOW_SEGMENTS,
	ACCOUNT_FLOW_SEGMENTS_WITH_METRICS,
	CREATE_FLOW_CONTACT_SEGMENT,
	DELETE_FLOW_SEGMENT,
	UPDATE_FLOW_SEGMENT,
} from './api-gql';

export const useListFlowContactSegments = () => {
	const { accountSelected } = useUser();
	const [isLoading, setLoading] = useState(true);
	const [data, setData] = useState<FlowContactSegmentFragment[]>();

	const query = async () => {
		if (!accountSelected) return;

		setLoading(true);

		const { data } = await apiClient.query<
			AccountFlowSegmentsQuery,
			AccountFlowSegmentsQueryVariables
		>({
			query: ACCOUNT_FLOW_SEGMENTS,
			variables: {
				accountId: accountSelected.account.id,
			},
			// remove this will break some effects that we need
			fetchPolicy: 'no-cache',
		});

		setData(data.accountFlowSegments);
		setLoading(false);
	};

	useEffect(() => {
		query();
	}, [accountSelected]);

	return { data, isLoading };
};

export const useListFlowContactSegmentsWithMetrics = () => {
	const { accountSelected } = useUser();
	const [isLoading, setLoading] = useState(true);
	const t = useTranslations('flow.segments');
	const [data, setData] = useState<FlowContactSegmentWithMetricsFragment[]>();

	const query = async () => {
		if (!accountSelected) return;

		setLoading(true);

		const { data } = await apiClient.query<
			AccountFlowSegmentsWithMetricsQuery,
			AccountFlowSegmentsWithMetricsQueryVariables
		>({
			query: ACCOUNT_FLOW_SEGMENTS_WITH_METRICS,
			variables: {
				accountId: accountSelected.account.id,
			},
		});

		setData(data.accountFlowSegments);
		setLoading(false);
	};

	const removeItemFromList = (item: FlowContactSegmentWithMetricsFragment) => {
		setData((prev) => prev?.filter((v) => v.id !== item.id));
	};
	const updateItemAtList = (item: FlowContactSegmentWithMetricsFragment) => {
		setData((prev) => prev?.map((v) => (v.id === item.id ? item : v)));
	};
	const addToList = (item: FlowContactSegmentWithMetricsFragment) => {
		setData((prev) => [...(prev || []), item]);
	};

	useEffect(() => {
		query();
	}, [accountSelected]);

	return { data, isLoading, removeItemFromList, updateItemAtList, addToList };
};

export const useDeleteFlowContactSegment = ({
	onDelete,
	item,
}: {
	item: FlowContactSegmentWithMetricsFragment;
	onDelete: () => void;
}) => {
	const { toast } = useToast();
	const t = useTranslations('flow.segments.actions');

	const deleteSegment = async () => {
		if (item.flow_instances_count) {
			toast({
				title: t('cantDeleteBecauseThereIsFlowsRelated.title'),
				description: t('cantDeleteBecauseThereIsFlowsRelated.description', {
					flowsRelated: item.flow_instances_count,
				}),
				duration: 10000,
			});
			return;
		}

		const loadingToast = toast({
			title: t('deletingItem'),
		});

		await apiClient.mutate<DeleteFlowSegmentMutation, DeleteFlowSegmentMutationVariables>(
			{
				mutation: DELETE_FLOW_SEGMENT,
				variables: {
					deleteFlowSegmentId: item.id,
				},
			},
		);

		loadingToast.update({
			id: loadingToast.id,
			title: t('itemSuccessfullyDeleted'),
			duration: 3000,
		});
		onDelete();
	};

	return { deleteSegment };
};

export const useUpdateFlowContactSegment = () => {
	const update = async (input: UpdateFlowContactSegmentInput) => {
		const { data } = await apiClient.mutate<
			UpdateFlowContactSegmentMutation,
			UpdateFlowContactSegmentMutationVariables
		>({
			mutation: UPDATE_FLOW_SEGMENT,
			variables: {
				input,
			},
		});

		return data?.updateFlowContactSegment!;
	};

	return { update };
};

export const useCreateFlowContactSegment = () => {
	const { accountSelected } = useUser();
	const create = async (input: Omit<CreateFlowContactSegmentInput, 'account'>) => {
		const { data } = await apiClient.mutate<
			CreateFlowContactSegmentMutation,
			CreateFlowContactSegmentMutationVariables
		>({
			mutation: CREATE_FLOW_CONTACT_SEGMENT,
			variables: {
				input: {
					account: accountSelected?.account.id!,
					...input,
				},
			},
		});

		return data?.createFlowContactSegment!;
	};

	return { create };
};
