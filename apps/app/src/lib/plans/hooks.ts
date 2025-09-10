'use client';

import { PricingCardData } from '@/app/[locale]/(logged)/plans/components/pricing-card';
import { withUserEventData } from '@/core/helpers/gtm';
import { apiClient } from '@/core/services/graphql';
import {
	CreateSubscriptionCheckoutMutation,
	CreateSubscriptionCheckoutMutationVariables,
} from '@/core/shared/gql-api-schema';
import { useUser } from '@/lib/user/context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import TagManager from 'react-gtm-module-custom-domain';
import { CREATE_SUBSCRIPTION_CHECKOUT } from './api-gql';

export const useCreateSubscriptionCheckout = () => {
	const router = useRouter();
	const { accountSelected, user } = useUser();
	const [isLoading, setLoading] = useState(false);

	const exec = async (input: PricingCardData) => {
		if (!accountSelected?.account.id) return;
		setLoading(true);

		try {
			const { data } = await apiClient.mutate<
				CreateSubscriptionCheckoutMutation,
				CreateSubscriptionCheckoutMutationVariables
			>({
				mutation: CREATE_SUBSCRIPTION_CHECKOUT,
				variables: {
					input: {
						accountId: accountSelected.account.id,
						priceExternalId: input.external_id,
					},
				},
			});

			TagManager.dataLayer({
				dataLayer: {
					event: 'begin_checkout',
					_clear: true,
					...withUserEventData(user!),
					plan_price: input.price,
					plan_name: input.name,
					plan_period: input.duration,
					plan_currency: input.currency,
				},
			});

			router.push(data?.createSubscriptionCheckout.url!);
		} catch (e) {
			console.log(e);
		} finally {
			setLoading(false);
		}
	};

	return { exec, isLoading };
};
