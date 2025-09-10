'use client';

import { firstDayOfLastMonth, lastDayOfLastMonth } from '@/core/helpers/date';
import { apiClient } from '@/core/services/graphql';
import {
	ActiveUserAffiliateQuery,
	ActiveUserAffiliateQueryVariables,
	AffiliateComissionListSort,
	AffiliateComissionQuery,
	AffiliateComissionQueryVariables,
	AffiliateComissionsCalcsFragment,
	AffiliateComissionsCalcsQuery,
	AffiliateComissionsCalcsQueryVariables,
	AffiliateComissionsListFilter,
	AffiliateFragment,
	AffiliatePayoutMethod,
	AffiliateSettingsResult,
	AffiliateSettingsResultErrorCode,
	CreateAffiliateForUserMutation,
	CreateAffiliateForUserMutationVariables,
	CreateUserAffiliateInput,
	FilterOperator,
	IsAffiliateAliasAvailableQuery,
	IsAffiliateAliasAvailableQueryVariables,
	SortOrder,
	UpdateUserAffiliateMutation,
	UpdateUserAffiliateMutationVariables,
} from '@/core/shared/gql-api-schema';
import { PaginationState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import * as Yup from 'yup';
import {
	ACTIVE_USER_AFFILIATE,
	AFFILIATE_COMISSIONS,
	AFFILIATE_COMISSIONS_CALCS,
	CREATE_USER_AFFILIATE,
	IS_AFFILIATE_ALIAS_AVAILABLE,
	UPDATE_USER_AFFILIATE,
} from './api-gql';
import { sanitizeAlias } from './helpers';

export type ManageAffiliateFormValues = {
	alias: string;
	isAliasAvailable?: boolean;
	password: string;
	payout_method: AffiliatePayoutMethod;
	payout_method_key: string;
};

export const useSetupManageAffiliateForm = () => {
	const defaultValues: Partial<ManageAffiliateFormValues> = {
		isAliasAvailable: true,
	};
	const t = useTranslations('affiliates.settings.errors');

	const schema = useMemo(() => {
		return Yup.object<ManageAffiliateFormValues>({
			alias: Yup.string()
				.required(t('mandatory'))
				.test(
					'is-available',
					(v) =>
						t('aliasNotAvailable', {
							alias: v.value,
						}),
					function (this) {
						return this.parent.isAliasAvailable;
					},
				),
			payout_method: Yup.string()
				.required(t('mandatory'))
				.test('is-valid', t('methodNotValid'), (v) =>
					v
						? Object.values(AffiliatePayoutMethod).includes(v as AffiliatePayoutMethod)
						: false,
				),
			payout_method_key: Yup.string()
				.required(t('mandatory'))
				.when('payout_method', {
					is: (v: AffiliatePayoutMethod) => v === AffiliatePayoutMethod.Paypal,
					then: () => Yup.string().required(t('mandatory')).email(t('emailNotValid')),
				}),
			password: Yup.string().required(t('mandatory')),
		});
	}, [t]);

	return { defaultValues, schema };
};

export const useManageAffiliateForm = (
	methods: UseFormReturn<ManageAffiliateFormValues>,
) => {
	const t = useTranslations('affiliates.settings');
	const router = useRouter();
	const [isDataLoading, setDataLoading] = useState(true);
	const [data, setData] = useState<AffiliateFragment>();
	const isEdit = !!data;

	const reset = (data: AffiliateFragment) => {
		methods.reset({
			...data,
			payout_method: data.payout_method!,
			payout_method_key: data.payout_method_key!,
		});
	};

	// Get user data to know if is edit or setup
	useEffect(() => {
		(async () => {
			setDataLoading(true);

			try {
				const { data } = await apiClient.query<
					ActiveUserAffiliateQuery,
					ActiveUserAffiliateQueryVariables
				>({
					query: ACTIVE_USER_AFFILIATE,
					fetchPolicy: 'no-cache',
				});

				if (data.activeUserAffiliate) {
					reset(data.activeUserAffiliate);
					setData(data.activeUserAffiliate);
				}
			} catch (e) {
				console.log(e);
			} finally {
				setDataLoading(false);
			}
		})();
	}, []);

	const onSubmit: SubmitHandler<ManageAffiliateFormValues> = async (values) => {
		const input: CreateUserAffiliateInput = {
			alias: sanitizeAlias(values.alias),
			payout_method: values.payout_method,
			payout_method_key: values.payout_method_key,
			password: values.password,
		};

		let result: AffiliateSettingsResult;

		if (isEdit) {
			const { data } = await apiClient.mutate<
				UpdateUserAffiliateMutation,
				UpdateUserAffiliateMutationVariables
			>({
				mutation: UPDATE_USER_AFFILIATE,
				variables: {
					input,
				},
			});
			result = data?.updateUserAffiliate!;
		} else {
			const { data } = await apiClient.mutate<
				CreateAffiliateForUserMutation,
				CreateAffiliateForUserMutationVariables
			>({
				mutation: CREATE_USER_AFFILIATE,
				variables: {
					input,
				},
			});
			result = data?.createAffiliateForUser!;
		}

		if (result.__typename === 'Affiliate') {
			router.push('/affiliate/overview');
		} else if (result.__typename === 'AffiliateSettingsResultError') {
			switch (result.errorCode) {
				case AffiliateSettingsResultErrorCode.InvalidPassword:
					methods.setError('password', {
						message: t('errors.invalidPassword'),
					});
					break;
			}
		}
	};

	return { isEdit, isDataLoading, onSubmit, data, reset };
};

export const useManageAffiliateFormAliasAvailability = ({
	data,
	form,
}: {
	data?: AffiliateFragment;
	form: UseFormReturn<ManageAffiliateFormValues>;
}) => {
	const [isCheckingAlias, setCheckingAlias] = useState(false);
	const { watch, setValue, trigger } = form;

	const [alias, isAliasAvailable] = watch(['alias', 'isAliasAvailable']);

	useEffect(() => {
		const update = (value: boolean) => {
			setValue('isAliasAvailable', value, {
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true,
			});
			trigger('alias');
			setCheckingAlias(false);
		};

		if (isAliasAvailable) {
			// This will block the user to click on submit
			// if was available and will not be
			setCheckingAlias(true);
		}

		if (data && alias === data.alias) {
			update(true);

			return;
		}

		// Debounce
		const timeout = setTimeout(() => {
			if (!alias?.trim()) {
				setCheckingAlias(false);
				return;
			}

			(async () => {
				setCheckingAlias(true);
				try {
					const { data } = await apiClient.query<
						IsAffiliateAliasAvailableQuery,
						IsAffiliateAliasAvailableQueryVariables
					>({
						query: IS_AFFILIATE_ALIAS_AVAILABLE,
						fetchPolicy: 'no-cache',
						variables: {
							alias,
						},
					});

					update(data.isAffiliateAliasAvailable);
				} catch (e) {
					console.log(e);
				} finally {
					setCheckingAlias(false);
				}
			})();
		}, 400);

		return () => clearTimeout(timeout);
	}, [alias]);

	return { isCheckingAlias };
};

export const useListAffiliateComissions = () => {
	const [data, setData] = useState<AffiliateComissionQuery['affiliateComissions']>();
	const [isLoading, setLoading] = useState(true);
	const [isActionsLoading] = useState(false);
	const [sort, _setSort] = useState<AffiliateComissionListSort>({
		date_created: SortOrder.Desc,
	});
	const [filters, setFilters] = useState<Omit<AffiliateComissionsListFilter, 'operator'>>(
		{},
	);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const setFilter = <D extends keyof Omit<AffiliateComissionsListFilter, 'operator'>>(
		key: D,
		value?: AffiliateComissionsListFilter[D],
	) => {
		setFilters((prev) => {
			if (!value) {
				const clone = {...prev};

				delete clone[key]

				return clone
			}

			return {
				...prev,
				[key]: value,
			};
		});
	};

	const setSort = (key: keyof AffiliateComissionListSort, value: SortOrder) => {
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

			try {
				const { data } = await apiClient.query<
					AffiliateComissionQuery,
					AffiliateComissionQueryVariables
				>({
					query: AFFILIATE_COMISSIONS,
					variables: {
						pagination: {
							sort,
							take:
								options?.take === null ? undefined : options?.take || pagination.pageSize,
							skip: options?.skip,
						},
						filter: {
							operator: FilterOperator.And,
							status: filters.status,
						},
					},
					fetchPolicy: 'no-cache',
				});

				if (mode === 'set') {
					setData(data.affiliateComissions);
				} else {
					setData((prev) => ({
						totalItems: prev?.totalItems!,
						items: [...prev?.items!, ...data.affiliateComissions!.items!],
					}));
				}
			} finally {
				setLoading(false);
			}
		},
		[filters, sort, pagination.pageSize],
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
		isActionsLoading,
	};
};

export const useAffiliateComissionsCalcs = () => {
	const [isLoading, setLoading] = useState(true);
	const [calcs, setCalcs] = useState<AffiliateComissionsCalcsFragment>();
	const [affiliate, setAffiliate] = useState<AffiliateFragment>();

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const { data } = await apiClient.query<
					AffiliateComissionsCalcsQuery,
					AffiliateComissionsCalcsQueryVariables
				>({
					query: AFFILIATE_COMISSIONS_CALCS,
					variables: {
						from: firstDayOfLastMonth(),
						to: lastDayOfLastMonth(),
					},
				});

				setAffiliate(data.activeUserAffiliate!);
				setCalcs(data.affiliateComissionsCalcs!);
			} catch (e) {
				console.log(e);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const lastMonthToThisComparsion = useMemo(() => {
		if (!calcs) return;

		return {
			isThisMonthHigher: calcs.pendingAmountToReceive > calcs.receivedLastMonth,
			diff: calcs.pendingAmountToReceive - calcs.receivedLastMonth,
		};
	}, [calcs?.receivedLastMonth, calcs?.pendingAmountToReceive]);

	return { isLoading, calcs, affiliate, lastMonthToThisComparsion };
};
