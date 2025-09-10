import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/core';
import { unique } from '@/core/helpers/array';
import {
	BatchUpdateFlowContact,
	BatchUpdateFlowContactMutation,
	BatchUpdateFlowContactMutationVariables,
	FilterOperator,
	FlowContactFragment,
	FlowContactListFilter,
	FlowContactListSort,
	ImportFlowContactsFromCsvMutation,
	ImportFlowContactsFromCsvMutationVariables,
	ImportFlowContactsFromCsvResult,
	PaginatedFlowContactsQuery,
	PaginatedFlowContactsQueryVariables,
	SortOrder,
	ToggleFlowContactInSegmentMode,
	ToggleFlowContactInSegmentMutation,
	ToggleFlowContactInSegmentMutationVariables,
} from '@/core/shared/gql-api-schema';
import { PaginationState, Row } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import * as Yup from 'yup';
import { useUser } from '..';
import {
	BATCH_UPDATE_FLOW_CONTACT,
	IMPORT_FLOW_CONTACTS_FROM_CSV,
	PAGINATED_FLOW_CONTACTS,
	TOGGLE_FLOW_CONTACT_IN_SEGMENT,
} from './api-gql';

export const useListFlowContacts = () => {
	const { accountSelected } = useUser();
	const [data, setData] = useState<PaginatedFlowContactsQuery['accountFlowContacts']>();
	const [isLoading, setLoading] = useState(true);
	const [selected, setSelected] = useState<Row<FlowContactFragment>[]>([]);
	const [search, setSearch] = useState('');
	const [sort, _setSort] = useState<FlowContactListSort>({
		date_created: SortOrder.Desc,
	});
	const [filters, setFilters] = useState<Omit<FlowContactListFilter, 'operator'>>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageSize: 10,
		pageIndex: 0,
	});
	const t = useTranslations('flow.contacts');
	const { toast } = useToast();

	const setFilter = (
		key: keyof Omit<FlowContactListFilter, 'operator'>,
		value?: string,
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

	const setSort = (key: keyof FlowContactListSort, value: SortOrder) => {
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
					PaginatedFlowContactsQuery,
					PaginatedFlowContactsQueryVariables
				>({
					query: PAGINATED_FLOW_CONTACTS,
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
							search,
							...filters,
						},
					},
					fetchPolicy: 'no-cache',
				});

				if (mode === 'set') {
					setData(data.accountFlowContacts);
				} else {
					setData((prev) => ({
						totalItems: prev?.totalItems!,
						items: [...prev?.items!, ...data.accountFlowContacts?.items!],
					}));
				}
			} finally {
				setLoading(false);
			}
		},
		[accountSelected?.account.id, filters, search, sort],
	);

	const updateItems = async (
		input: Omit<BatchUpdateFlowContact, 'id'>,
		/**
		 * If not provided, it will use the selected items
		 */
		_itemsId?: string[],
	) => {
		if (!accountSelected?.account.id) return;

		const isUpdatingSelected = !_itemsId;
		const itemsId = _itemsId || selected.map((item) => item.original.id);

		const toastInfo = toast({
			description: t('oneOrMoreItemsUpdating', {
				count: itemsId.length,
			}),
		});

		const updateResult = await apiClient.mutate<
			BatchUpdateFlowContactMutation,
			BatchUpdateFlowContactMutationVariables
		>({
			mutation: BATCH_UPDATE_FLOW_CONTACT,
			variables: {
				input: itemsId.map((id) => ({
					id,
					...input,
				})),
			},
		});

		isUpdatingSelected && setSelected([]);

		setData((prev) => ({
			totalItems: prev?.totalItems!,
			items: unique(
				[...(prev?.items || []), ...(updateResult.data?.batchUpdateFlowContact || [])],
				'id',
			),
		}));

		toastInfo.update({
			id: toastInfo.id,
			description: t('oneOrMoreItemsUpdated', {
				count: itemsId.length,
			}),
		});
	};

	const toggleInSegment = async (
		input: { mode: ToggleFlowContactInSegmentMode; segmentId: string },
		/**
		 * If not provided, it will use the selected items
		 */
		_itemsId?: string[],
	) => {
		if (!accountSelected?.account.id) return;

		const isUpdatingSelected = !_itemsId;
		const itemsId = _itemsId || selected.map((item) => item.original.id);

		const toastInfo = toast({
			description: t('oneOrMoreItemsUpdating', {
				count: itemsId.length,
			}),
		});

		const updateResult = await apiClient.mutate<
			ToggleFlowContactInSegmentMutation,
			ToggleFlowContactInSegmentMutationVariables
		>({
			mutation: TOGGLE_FLOW_CONTACT_IN_SEGMENT,
			variables: {
				input: {
					contactId: itemsId,
					...input,
				},
			},
		});

		isUpdatingSelected && setSelected([]);

		setData((prev) => ({
			totalItems: prev?.totalItems!,
			items: unique(
				[
					...(prev?.items || []),
					...(updateResult.data?.toggleFlowContactInSegment || []),
				],
				'id',
			),
		}));

		toastInfo.update({
			id: toastInfo.id,
			description: t('oneOrMoreItemsUpdated', {
				count: itemsId.length,
			}),
		});
	};

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
		selected,
		setSelected,
		updateItems,
		toggleInSegment,
	};
};

export type ImportFlowContactsFormValues = {
	step: number;
	isOpen: boolean;
	steps: {
		'0': { segment_id?: string };
		'1': { file?: File };
	};
	result?: ImportFlowContactsFromCsvResult;
};

export const useSetupFlowContactImportForm = () => {
	const t = useTranslations('flow.contacts.importing.errors');

	const defaultValues: Partial<ImportFlowContactsFormValues> = {
		step: 0,
		isOpen: false,
		steps: {
			'0': {},
			'1': {},
		},
	};

	const schema = Yup.object({
		steps: Yup.object({
			'0': Yup.object({
				segment_id: Yup.string().required(t('selectASegment')),
			}),
			'1': Yup.object({
				file: Yup.mixed().required(t('selectAFile')),
			}),
		}),
	});

	return { schema, defaultValues };
};

export const useFlowContactImportForm = (
	methods: UseFormReturn<ImportFlowContactsFormValues>,
) => {
	const { accountSelected } = useUser();
	const t = useTranslations('flow.contacts.importing');

	const onSubmit: SubmitHandler<ImportFlowContactsFormValues> = async ({ steps }) => {
		const { data } = await apiClient.mutate<
			ImportFlowContactsFromCsvMutation,
			ImportFlowContactsFromCsvMutationVariables
		>({
			mutation: IMPORT_FLOW_CONTACTS_FROM_CSV,
			variables: {
				csv: steps[1].file!,
				input: {
					account: accountSelected?.account.id!,
					segment: steps[0].segment_id!,
				},
			},
		});

		methods.setValue('result', data?.importFlowContactsFromCsv!);
	};

	return { onSubmit };
};
