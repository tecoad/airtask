'use client';

import { useToast } from '@/components/ui/use-toast';
import { unique } from '@/core/helpers/array';
import { apiClient } from '@/core/services/graphql';
import {
	AccountQuotationQuery,
	AccountQuotationQueryVariables,
	AccountQuotationRequestQuery,
	AccountQuotationRequestQueryVariables,
	AccountQuotationRequestsQuery,
	AccountQuotationRequestsQueryVariables,
	AccountQuotationsQuery,
	AccountQuotationsQueryVariables,
	AccountUsageKind,
	DeleteQuotationMutation,
	DeleteQuotationMutationVariables,
	DeleteQuotationQuestionMutation,
	DeleteQuotationQuestionMutationVariables,
	FilterOperator,
	FullQuotationRequestFragment,
	OnBoardingStepName,
	QuotationFragment,
	QuotationModelBySegmentQuery,
	QuotationModelBySegmentQueryVariables,
	QuotationRequestFilter,
	QuotationRequestSearch,
	QuotationStatus,
	SimpleQuotationRequestFragment,
	SoftDeleteQueryMode,
	SortOrder,
	ToggleQuotationRequestCheckMutation,
	VisualizeQuotationRequestMutation,
	VisualizeQuotationRequestMutationVariables,
} from '@/core/shared/gql-api-schema';
import { useCachedAccountSteps } from '@/lib/account';
import { useUser } from '@/lib/user';
import { useTranslations } from 'next-intl';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';

import { useGlobalEvents } from '@/core/contexts/global-events';
import { PaginationState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import * as Yup from 'yup';
import {
	ACCOUNT_QUOTATION,
	ACCOUNT_QUOTATIONS,
	DELETE_ACCOUNT_QUOTATION,
	DELETE_QUOTATION_QUESTION,
	QUOTATION_MODEL_BY_SEGMENT,
	QUOTATION_REQUEST,
	QUOTATION_REQUESTS,
	TOGGLE_QUOTATION_REQUEST_CHECK,
	VISUALIZE_QUOTATION_REQUEST,
} from './api-gql';
import { buildNestedQuestionTree } from './helpers';
import { createQuotation, updateQuotation } from './resolvers';

export const useDeleteQuotation = () => {
	const [isLoading, setLoading] = useState(false);
	const { emit } = useGlobalEvents();

	const deleteQuotation = async (id: string) => {
		try {
			setLoading(true);
			await apiClient.mutate<DeleteQuotationMutation, DeleteQuotationMutationVariables>({
				mutation: DELETE_ACCOUNT_QUOTATION,
				variables: {
					deleteQuotationId: id,
				},
			});

			emit('moduleDeleted', {
				instanceId: id,
				moduleName: AccountUsageKind.Quotation,
			});
		} catch (e) {
			console.log(e);
		} finally {
			setLoading(false);
		}
	};

	return { isLoading, deleteQuotation };
};

export const useDeleteSingleQuotation = () => {
	const router = useRouter();

	const [isDeleteLoading, setDeleteLoading] = useState(false);

	const deleteQuotation = async (id: string) => {
		try {
			setDeleteLoading(true);
			const res = await apiClient.mutate<
				DeleteQuotationMutation,
				DeleteQuotationMutationVariables
			>({
				mutation: DELETE_ACCOUNT_QUOTATION,
				variables: {
					deleteQuotationId: id,
				},
			});

			if (res.data?.deleteQuotation) {
				router.push('/modules/quotation');
			}
		} catch (e) {
			console.log(e);
		} finally {
			setDeleteLoading(false);
		}
	};

	return { deleteQuotation, isDeleteLoading };
};

export type QuestionForm = {
	id?: string;
	parentId?: string;
	order: number;
	label: string;
	active: boolean;
	condition?: string;
	children: QuestionForm[];
};

export type QuotationFormValues = {
	id?: string;
	title: string;
	promptInstructions: string;
	status: QuotationStatus;
	questions: QuestionForm[];
};

export const useSetupQuotationForm = () => {
	const query = useSearchParams();

	const defaultValues = useMemo<QuotationFormValues>(
		() => ({
			title: query.get('title')!,
			status: QuotationStatus.Published,
			promptInstructions: '',
			questions: [
				{
					label: '',
					children: [],
					order: 1,
					active: true,
				},
			],
		}),
		[],
	);

	const t = useTranslations('quotation.edit.errors');

	const schema = useMemo(() => {
		const questionSchema: any = Yup.object({
			label: Yup.string()
				.required(t('mandatory'))
				.min(3, t('minimumCharacters', { number: 3 }))
				.test('is-valid', t('endsWithInterrogation'), function (value) {
					return (value || '').trim().endsWith('?');
				}),
			condition: Yup.string()
				.nullable()
				.test('is-valid', t('invalidCondition'), function (this, value) {
					// This question has no condition
					if (typeof this.parent.condition !== 'string') return true;

					return (value || '').trim().length > 0;
				}),
			children: Yup.array().of(Yup.lazy(() => questionSchema.default(undefined)) as any),
		});

		return Yup.object({
			title: Yup.string().required(t('mandatory')),
			// .min(3, validation("minimumCharacters", { number: 3 })),
			questions: Yup.array()
				.of(questionSchema)
				.min(1, t('minimumQuestions', { number: 1 })),
		});
	}, []);

	return { defaultValues, schema };
};

export const useQuotationForm = (methods: UseFormReturn<QuotationFormValues>) => {
	const t = useTranslations('quotation.instance');
	const { ensureAccountStepIsConcluded } = useCachedAccountSteps();
	const { accountSelected } = useUser();
	const { toast } = useToast();
	const [data, setData] = useState<QuotationFragment>();
	const [isDataLoading, setDataLoading] = useState(true);
	const params = useParams();
	const router = useRouter();
	const { emit } = useGlobalEvents();

	const id = params.id;
	// const id = router.query.id as string;
	const isEdit = !!id;

	const resetFormFromData = (input?: QuotationFragment) => {
		methods.reset({
			id: input?.id,
			title: input?.title,
			promptInstructions: input?.prompt_instructions || '',
			questions: input?.questions
				? buildNestedQuestionTree(
						input.questions.map((v) => ({
							label: v.label!,
							condition: v.condition!,
							id: v.id,
							parentId: v.parent!,
							order: v.order,
							active: v.active,
						})),
				  )
				: [],
			status: input?.status,
		});
	};

	const updateQuotationData = async () => {
		const { data: res } = await apiClient.query<
			AccountQuotationQuery,
			AccountQuotationQueryVariables
		>({
			query: ACCOUNT_QUOTATION,
			variables: {
				accountQuotationId: id as string,
			},
			fetchPolicy: 'no-cache',
		});

		if (res.accountQuotation) {
			resetFormFromData(res.accountQuotation);
			setData(res.accountQuotation);
		} else {
			setData(undefined);
		}
	};

	useEffect(() => {
		if (!isEdit) {
			setDataLoading(false);
			setData(undefined);
			return;
		}

		setDataLoading(true);

		updateQuotationData().finally(() => {
			setDataLoading(false);
		});
	}, [isEdit]);

	const onSubmit: SubmitHandler<QuotationFormValues> = async (values) => {
		// Is edit
		if (values.id) {
			const updated = await updateQuotation(values, data!);

			setData(updated);
			resetFormFromData(updated);

			emit('moduleUpdated', {
				data: {
					id: updated.id,
					title: updated.title,
				},
				moduleName: AccountUsageKind.Quotation,
			});

			toast({
				description: t('instanceUpdated', { instance: updated.title }),
			});

			return;
		}

		// Is create
		const { id, title } = await createQuotation(values, accountSelected?.account.id!);

		emit('moduleCreated', {
			data: {
				id,
				title,
			},
			moduleName: AccountUsageKind.Quotation,
		});
		ensureAccountStepIsConcluded(OnBoardingStepName.CreateFirstQuotation);

		toast({
			description: t('instanceCreated', { instance: title }),
		});

		router.push(`/modules/quotation/${id}/install`);
	};

	return { onSubmit, isEdit, isDataLoading, data, resetFormFromData };
};

export const useQuotationFromModel = () => {
	const { accountSelected } = useUser();
	const [modelQuotation, setModelQuotation] = useState<QuotationFragment | null>(null);

	const segment = accountSelected?.account.segment;

	useEffect(() => {
		if (!segment) return;

		apiClient
			.query<QuotationModelBySegmentQuery, QuotationModelBySegmentQueryVariables>({
				query: QUOTATION_MODEL_BY_SEGMENT,
				variables: {
					segmentId: segment.id,
				},
			})
			.then(({ data }) => {
				if (data.quotationModelBySegment) {
					setModelQuotation(data.quotationModelBySegment);
				}
			})
			.catch(console.log);
	}, [segment?.id]);

	return { modelQuotation };
};

export const useDeleteQuestion = () => {
	const [isLoading, setLoading] = useState(false);

	const exec = async (id: string) => {
		setLoading(true);

		try {
			await apiClient.mutate<
				DeleteQuotationQuestionMutation,
				DeleteQuotationQuestionMutationVariables
			>({
				mutation: DELETE_QUOTATION_QUESTION,
				variables: {
					deleteQuotationQuestionId: id,
				},
			});
		} catch (e) {
			console.log(e);
		} finally {
			setLoading(false);
		}
	};

	return { isLoading, exec };
};

export const useQuotationRequests = () => {
	const t = useTranslations('quotation');

	const { accountSelected } = useUser();
	const { toast } = useToast();
	const [data, setData] =
		useState<AccountQuotationRequestsQuery['accountQuotationRequests']>();
	const [isLoading, setLoading] = useState(true);
	const [selected, setSelected] = useState<string[]>([]);
	const [search, setSearch] = useState('');
	const [sort, _setSort] = useState<QuotationRequestSearch>({
		date_created: SortOrder.Desc,
	});
	const [filters, setFilters] = useState<Omit<QuotationRequestFilter, 'operator'>>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageSize: 10,
		pageIndex: 0,
	});
	const params = useParams();
	const quotationId = params.id as string;

	const setFilter = <D extends keyof Omit<QuotationRequestFilter, 'operator'>>(
		key: D,
		value?: Omit<QuotationRequestFilter, 'operator'>[D],
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

	const setSort = (key: keyof QuotationRequestSearch, value: SortOrder) => {
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
					AccountQuotationRequestsQuery,
					AccountQuotationRequestsQueryVariables
				>({
					query: QUOTATION_REQUESTS,
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
							quotation: quotationId,
							is_checked: filters.is_checked,
							recipientQuery: search,
						},
					},
					fetchPolicy: 'no-cache',
				});

				if (mode === 'set') {
					setData(data.accountQuotationRequests);
				} else {
					setData((prev) => ({
						totalItems: prev?.totalItems!,
						items: [...prev?.items!, ...data.accountQuotationRequests.items!],
					}));
				}
			} finally {
				setLoading(false);
			}
		},
		[accountSelected?.account.id, filters, search, sort, quotationId],
	);

	const setSelectedAsChecked = async (newValue: boolean) => {
		if (!selected.length) return;

		try {
			const toastInfo = toast({
				description: t('updatingItems', { count: selected.length }),
			});

			const itemsToLookAt =
				data?.items.filter((item) => selected.includes(item.id)) || [];

			let toToggle: SimpleQuotationRequestFragment[] = [];

			if (newValue) {
				const notChecked = itemsToLookAt.filter((i) => !i.checked_at);

				toToggle = notChecked || [];
			} else {
				const checked = itemsToLookAt.filter((i) => i.checked_at);

				toToggle = checked || [];
			}

			const res = await apiClient.mutate<ToggleQuotationRequestCheckMutation>({
				mutation: TOGGLE_QUOTATION_REQUEST_CHECK,
				variables: {
					requestId: toToggle.map((v) => v.id),
				},
			});

			setData((prev) => ({
				totalItems: prev?.totalItems!,
				items: unique(
					[...(prev?.items || []), ...(res.data?.toggleQuotationRequestCheck || [])],
					'id',
				),
			}));

			toastInfo.update({
				id: toastInfo.id,
				description: t('updatedItems'),
			});
		} catch (e) {
			console.log(e);
		}
	};

	const toggleSingleAsChecked = async (id: string) => {
		const toastInfo = toast({
			description: t('itemsUpdating'),
		});

		try {
			const res = await apiClient.mutate<ToggleQuotationRequestCheckMutation>({
				mutation: TOGGLE_QUOTATION_REQUEST_CHECK,
				variables: {
					requestId: [id],
				},
			});

			setData((prev) => ({
				totalItems: prev?.totalItems!,
				items: unique(
					[...(prev?.items || []), ...(res.data?.toggleQuotationRequestCheck || [])],
					'id',
				),
			}));
		} catch (e) {
			console.log(e);
		} finally {
			toastInfo.update({
				id: toastInfo.id,
				description: t('itemUpdated'),
			});
		}
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
		setSelectedAsChecked,
		toggleSingleAsChecked,
	};
};

export const useFetchQuotationRequest = () => {
	const params = useParams();
	const { requestId, id: quotationId } = params;
	const [data, setData] = useState<FullQuotationRequestFragment>();
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			if (!requestId || !quotationId) return;

			try {
				setLoading(true);

				const { data } = await apiClient.query<
					AccountQuotationRequestQuery,
					AccountQuotationRequestQueryVariables
				>({
					query: QUOTATION_REQUEST,
					variables: {
						quotationId: quotationId as string,
						requestSequentialId: requestId as string,
					},
					fetchPolicy: 'no-cache',
				});

				setData(data.accountQuotationRequest!);

				setLoading(false);

				if (data.accountQuotationRequest && !data.accountQuotationRequest.visualized_at) {
					await apiClient.mutate<
						VisualizeQuotationRequestMutation,
						VisualizeQuotationRequestMutationVariables
					>({
						mutation: VISUALIZE_QUOTATION_REQUEST,
						variables: {
							requestId: data.accountQuotationRequest.id,
						},
					});
				}
			} catch (e) {
				notFound();
				console.log(e);
			} finally {
				setLoading(false);
			}
		})();
	}, [requestId, quotationId]);

	return { data, setData, isLoading };
};

export const useToggleRequestCheck = () => {
	const [isChecking, setChecking] = useState(false);

	const toggleRequestCheck = async (id: string) => {
		setChecking(true);

		try {
			const res = await apiClient.mutate<ToggleQuotationRequestCheckMutation>({
				mutation: TOGGLE_QUOTATION_REQUEST_CHECK,
				variables: {
					requestId: [id],
				},
			});

			return res.data?.toggleQuotationRequestCheck[0]!;
		} catch (e) {
			console.log(e);
		} finally {
			setChecking(false);
		}
	};

	return { isChecking, toggleRequestCheck };
};

export const useListAccountQuotation = () => {
	const { accountSelected } = useUser();
	const [data, setData] = useState<QuotationFragment[]>();
	const [isLoading, setLoading] = useState(true);

	const query = async () => {
		if (!accountSelected) return;

		const res = await apiClient.query<
			AccountQuotationsQuery,
			AccountQuotationsQueryVariables
		>({
			query: ACCOUNT_QUOTATIONS,
			variables: {
				account: accountSelected.account.id,
				mode: SoftDeleteQueryMode.ShowOnlyNotDeleted,
			},
			fetchPolicy: 'no-cache',
		});

		setData(res.data.accountQuotations);
	};

	useEffect(() => {
		setLoading(true);
		query()
			.catch(console.error)
			.finally(() => setLoading(false));
	}, [accountSelected?.account.id]);

	return { data, isLoading };
};
