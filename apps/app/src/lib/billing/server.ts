import { getApiClient } from '@/core/services/graphql/api/server';
import {
	AccountSubscriptionDataQuery,
	AccountSubscriptionDataQueryVariables,
} from '@/core/shared/gql-api-schema';
import { notFound, redirect } from 'next/navigation';
import { getSimplifiedUserInfos, getUserSelectedAccount } from '../user/server';
import { ACCOUNT_SUBSCRIPTION_DATA } from './api-gql';

export const loadAccountSubscriptionData = async () => {
	try {
		const user = await getSimplifiedUserInfos();

		if (!user) notFound();

		const accountId = getUserSelectedAccount(user).account.id;

		const res = await getApiClient().query<
			AccountSubscriptionDataQuery,
			AccountSubscriptionDataQueryVariables
		>({
			query: ACCOUNT_SUBSCRIPTION_DATA,
			variables: {
				accountId,
			},
		});

		const data = res.data.accountSubscriptionData;

		if (!data) notFound();

		return {
			data,
			account: user.accounts.find((item) => item.account.id === accountId)!,
		};
	} catch (e) {
		redirect('/plans');
	}
};
