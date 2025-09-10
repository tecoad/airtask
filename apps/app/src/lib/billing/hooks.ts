'use client';

import { apiClient } from '@/core/services/graphql';
import {
	CreateExtraCreditCheckoutMutation,
	CreateExtraCreditCheckoutMutationVariables,
	SubscriptionPortalQuery,
	SubscriptionPortalQueryVariables,
} from '@/core/shared/gql-api-schema';
import { QuotationFormValues } from '@/lib/quotation';
import { useUser } from '@/lib/user';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UseFormReturn, useFormContext } from 'react-hook-form';
import { CREATE_EXTRA_CREDIT_PRODUCT_CHECKOUT, SUBSCRIPTION_PORTAL } from './api-gql';

export const useSubscriptionPortal = () => {
	const [isLoading, setLoading] = useState(false);
	const { accountSelected } = useUser();
	const router = useRouter();

	const accountId = accountSelected?.account?.id;

	const exec = async () => {
		setLoading(true);
		const { data } = await apiClient.query<
			SubscriptionPortalQuery,
			SubscriptionPortalQueryVariables
		>({
			query: SUBSCRIPTION_PORTAL,
			variables: {
				input: {
					accountId: accountId!,
				},
			},
		});
		setLoading(false);

		router.push(data.subscriptionPortal.url);
	};

	return { isLoading, exec };
};

export const useCreateExtraCreditProductCheckout = () => {
	const { accountSelected } = useUser();
	const [isLoading, setLoading] = useState(false);
	const router = useRouter();

	const exec = async (externalPriceId: string) => {
		setLoading(true);

		try {
			const { data } = await apiClient.mutate<
				CreateExtraCreditCheckoutMutation,
				CreateExtraCreditCheckoutMutationVariables
			>({
				mutation: CREATE_EXTRA_CREDIT_PRODUCT_CHECKOUT,
				variables: {
					input: {
						accountId: accountSelected?.account.id!,
						priceExternalId: externalPriceId,
					},
				},
			});

			router.push(data?.createExtraCreditCheckout.url!);
		} catch (e) {
			console.log(e);
		} finally {
			setLoading(false);
		}
	};

	return { exec, isLoading };
};

export const useReorderQuestions = (
	methods: UseFormReturn<QuotationFormValues> | null,
	listKey: string,
) => {
	const ctx = useFormContext<QuotationFormValues>();
	const { getValues, setValue } = methods ?? ctx;

	const reOrder = (from: number, to: number) => {
		let list = getValues(listKey as 'questions');
		const item = list[from];
		list.splice(from, 1);
		list.splice(to, 0, item);

		// Here we just make sure order is correct
		list = list.map((v, k) => ({
			...v,
			order: k + 1,
		}));

		setValue(listKey as 'questions', list, {
			shouldTouch: true,
			shouldDirty: true,
		});
	};

	return { reOrder };
};
