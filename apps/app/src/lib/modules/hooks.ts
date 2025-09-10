import { apiClient } from '@/core';
import { useGlobalEvents } from '@/core/contexts/global-events';
import {
	AccountAllModulesQuery,
	AccountAllModulesQueryVariables,
	AccountUsageKind,
	SoftDeleteQueryMode,
} from '@/core/shared/gql-api-schema';
import { useEffect, useState } from 'react';
import { useUser } from '../user';
import { GET_ACCOUNT_ALL_MODULES } from './api-gql';

export type GroupedModulesData = {
	moduleName: AccountUsageKind;
	data: GenericModuleData[];
};

export type GenericModuleData = {
	id: string | number;
	title: string;
};

export const useListAccountModules = () => {
	const [data, setData] = useState<GroupedModulesData[]>();
	const [isLoading, setLoading] = useState(true);
	const { accountSelected } = useUser();
	const modules = Object.values(AccountUsageKind);

	const mapQueryByModules = (
		moduleName: AccountUsageKind,
		data: AccountAllModulesQuery,
	): GenericModuleData[] => {
		switch (moduleName) {
			case AccountUsageKind.Quotation:
				return data.accountQuotations.map((v) => ({
					id: v.id,
					title: v.title,
				}));
			default:
				return []; // return an empty array or handle other cases as needed
		}
	};

	const query = async (): Promise<GroupedModulesData[]> => {
		if (!accountSelected) return [];

		const res = await apiClient.query<
			AccountAllModulesQuery,
			AccountAllModulesQueryVariables
		>({
			query: GET_ACCOUNT_ALL_MODULES,
			variables: {
				account: accountSelected.account.id,
				mode: SoftDeleteQueryMode.ShowOnlyNotDeleted,
			},
			fetchPolicy: 'no-cache',
		});

		return modules.flatMap((v) => {
			const data = mapQueryByModules(v, res.data);

			// If there isn't any instance for this module, the module shouldnt be at the list
			if (!data.length) return [];

			return {
				moduleName: v,
				data,
			};
		});
	};

	useEffect(() => {
		setLoading(true);
		query()
			.then((v) => setData(v))
			.catch(console.error)
			.finally(() => setLoading(false));
	}, [accountSelected]);

	const { subscribe } = useGlobalEvents();

	useEffect(() => {
		return subscribe('moduleDeleted', ({ instanceId, moduleName }) => {
			setData((prev) => {
				return prev?.slice().map((v) => {
					if (v.moduleName === moduleName) {
						v.data = v.data.filter((item) => item.id !== instanceId);
					}

					return v;
				});
			});
		});
	}, []);

	useEffect(() => {
		return subscribe('moduleCreated', ({ data, moduleName }) => {
			setData((prev) => {
				return prev?.slice().map((v) => {
					if (v.moduleName === moduleName) {
						v.data.push(data);
					}

					return v;
				});
			});
		});
	}, []);

	useEffect(() => {
		return subscribe('moduleUpdated', ({ data, moduleName }) => {
			setData((prev) => {
				return prev?.slice().map((group) => {
					if (group.moduleName === moduleName) {
						group.data = group.data.map((v) => {
							if (v.id === data.id) {
								return data;
							}

							return v;
						});
					}

					return group;
				});
			});
		});
	}, []);

	return { data, isLoading };
};
