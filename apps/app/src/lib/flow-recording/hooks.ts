import { apiClient } from '@/core';
import {
	FilterOperator,
	FlowRecordingListFilter,
	FlowRecordingListSort,
	FlowRecordingsQuery,
	FlowRecordingsQueryVariables,
	SortOrder,
} from '@/core/shared/gql-api-schema';
import { PaginationState } from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';
import { useUser } from '..';
import { FLOW_RECORDINGS } from './api-gql';

export const useListFlowRecording = () => {
	const { accountSelected } = useUser();
	const [data, setData] = useState<FlowRecordingsQuery['flowRecordings']>();
	const [isLoading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [sort, _setSort] = useState<FlowRecordingListSort>({
		date_created: SortOrder.Desc,
	});
	const [filters, setFilters] = useState<Omit<FlowRecordingListFilter, 'operator'>>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageSize: 10,
		pageIndex: 0,
	});

	const setFilter = <D extends keyof Omit<FlowRecordingListFilter, 'operator'>>(
		key: D,
		value?: FlowRecordingListFilter[D],
	) => {
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

	const setSort = (key: keyof FlowRecordingListSort, value: SortOrder) => {
		_setSort({
			[key]: value,
		});
	};

	const fetchData = useCallback(
		async (
			options?: { skip?: number; take?: number | null },
			mode: 'set' | 'append' = 'set',
		) => {
			setLoading(true);

			if (!accountSelected?.account.id) return;

			try {
				const { data } = await apiClient.query<
					FlowRecordingsQuery,
					FlowRecordingsQueryVariables
				>({
					query: FLOW_RECORDINGS,
					variables: {
						accountId: accountSelected.account.id,
						pagination: {
							sort,
							take:
								options?.take === null ? undefined : options?.take || pagination.pageSize,
							skip: options?.skip,
						},
						filter: {
							operator: FilterOperator.And,
							contact_search: search.trim() ? search : undefined,
							...filters,
						},
					},
					fetchPolicy: 'no-cache',
				});

				if (mode === 'set') {
					setData(data.flowRecordings);
				} else {
					setData((prev) => ({
						totalItems: prev?.totalItems!,
						items: [...prev?.items!, ...data.flowRecordings?.items!],
					}));
				}
			} finally {
				setLoading(false);
			}
		},
		[accountSelected?.account.id, filters, search, sort],
	);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return {
		data,
		isLoading,
		fetchData,
		pagination,
		setPagination,
		filters,
		setFilter,
		setFilters,
		setSort,
		setSearch,
	};
};
