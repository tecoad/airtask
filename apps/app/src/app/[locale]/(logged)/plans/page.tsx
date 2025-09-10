import { Metadata } from 'next';

import { getApiClient } from '@/core/services/graphql/api/server';
import {
	PlanInterval,
	SubscriptionPlansQuery,
	SubscriptionPlansQueryVariables,
} from '@/core/shared/gql-api-schema';
import { SUBSCRIPTION_PLANS } from '@/lib';
import { cookies } from 'next/headers';
import { Tables } from './components/tables';

export const metadata: Metadata = {
	title: 'Plans',
};

export default async function Page() {
	const cookiesList = cookies();
	const hasCookie = cookiesList.has('en_fr');

	const { data } = await getApiClient().query<
		SubscriptionPlansQuery,
		SubscriptionPlansQueryVariables
	>({
		query: SUBSCRIPTION_PLANS,
	});

	// Filtering plan based on Cookie free Plan
	const filteredPlans = data.subscriptionPlans.slice().filter((plan) => {
		if (hasCookie) {
			return true;
		}
		const mensalPrice = plan.prices.find((v) => v.interval === PlanInterval.Month);
		return mensalPrice && Number(mensalPrice.price) !== 0;
	});

	return (
		<Tables
			plans={filteredPlans.sort((a, b) => {
				const aMensal = a.prices.find((v) => v.interval === PlanInterval.Month),
					bMensal = b.prices.find((v) => v.interval === PlanInterval.Month);

				return Number(aMensal?.price) - Number(bMensal?.price);
			})}
		/>
	);
}
