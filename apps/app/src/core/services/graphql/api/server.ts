import { ApolloLink } from '@apollo/client';
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc';
import {
	NextSSRApolloClient,
	NextSSRInMemoryCache,
} from '@apollo/experimental-nextjs-app-support/ssr';
import { cookies } from 'next/headers';
import { apolloLink } from './link';

const operationNameMiddleware = new ApolloLink((operation, forward) => {
	const cookiesList = cookies().getAll();

	const cookieString = cookiesList
		.map((cookie) => `${cookie.name}=${cookie.value}`)
		.join('; ');

	operation.setContext(({ headers = {} }) => ({
		headers: {
			...headers,
			cookie: cookieString,
		},
	}));

	return forward(operation);
});

export const { getClient: getApiClient } = registerApolloClient(() => {
	return new NextSSRApolloClient({
		cache: new NextSSRInMemoryCache(),
		link: ApolloLink.from([operationNameMiddleware, apolloLink]),
	});
});
