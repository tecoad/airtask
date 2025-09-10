import { adminClient } from '@/core/services/graphql';
import {
	FilterOperator,
	SortOrder,
	StartSimulationModeMutation,
	StartSimulationModeMutationVariables,
	UsersListFilter,
	UsersListSort,
	UsersQuery,
	UsersQueryVariables,
} from '@/core/shared/admin-gql-api-schema';
import { useCallback, useEffect, useState } from 'react';
import { LIST_USERS, SIMULATE_USER } from './admin-gql';

export const useListUsers = () => {
	const [data, setData] = useState<UsersQuery['users']>();
	const [isLoading, setLoading] = useState(true);
	const [isActionsLoading] = useState(false);
	const [search, setDebounceSearch] = useState('');
	const [_search, setSearch] = useState('');
	const [sort, _setSort] = useState<UsersListSort>({
		date_created: SortOrder.Desc,
	});
	const [filters, setFilters] = useState<Omit<UsersListFilter, 'operator'>>({});
	const pageSize = 10;

	const setFilter = (key: keyof Omit<UsersListFilter, 'operator'>, value?: string) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const setSort = (key: keyof UsersListSort, value: SortOrder) => {
		_setSort({
			[key]: value,
		});
	};

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebounceSearch(_search);
		}, 300);

		return () => {
			clearTimeout(timeout);
		};
	}, [_search]);

	const fetchData = useCallback(
		async (
			options?: { skip?: number; take?: number },
			mode: 'set' | 'append' = 'set',
		) => {
			setLoading(true);

			try {
				const { data } = await adminClient.query<UsersQuery, UsersQueryVariables>({
					query: LIST_USERS,
					variables: {
						pagination: {
							sort,
							take: pageSize,
							skip: options?.skip,
						},
						filter: {
							operator: FilterOperator.And,

							mainQuery: search,
						},
					},
					fetchPolicy: 'no-cache',
				});

				if (mode === 'set') {
					setData(data.users);
				} else {
					setData((prev) => ({
						totalItems: prev?.totalItems!,
						items: [...prev?.items!, ...data.users.items!],
					}));
				}
			} finally {
				setLoading(false);
			}
		},
		[filters, search, sort],
	);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return {
		data,
		isLoading,
		fetchData,
		pageSize,
		filters,
		setFilter,
		setSort,
		setSearch,
		isActionsLoading,
	};
};

export const useAdminSimulationMode = () => {
	const [isLoading, setLoading] = useState(false);

	const exec = async (focusUserId: string) => {
		setLoading(true);
		await adminClient.mutate<
			StartSimulationModeMutation,
			StartSimulationModeMutationVariables
		>({
			mutation: SIMULATE_USER,
			variables: {
				focusUserId,
			},
		});

		setLoading(false);

		// Refresh window
		window.location.reload();
	};

	return { exec, isLoading };
};
