import { ENV } from '@/core/config/env';
import { LOGOUT_USER } from '@/lib/sign/api-gql';
import { ApolloLink, split } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition, print } from '@apollo/client/utilities';
import { createUploadLink } from 'apollo-upload-client';
import axios from 'axios';
import { createClient } from 'graphql-ws';

const httpLink = createUploadLink({
	uri: ENV.API.graphql_urL,
	credentials: 'include',
}) as any;

const operationNameMiddleware = new ApolloLink((operation, forward) => {
	operation.setContext(({ headers = {} }) => ({
		headers: {
			...headers,
			'x-apollo-operation-name': operation.operationName,
		},
	}));

	return forward(operation);
});

const errorMiddleware = onError(({ graphQLErrors, networkError }) => {
	if (graphQLErrors) {
		graphQLErrors.forEach(({ message, locations, path }) => {
			if (message.toLowerCase() === 'unauthorized' && typeof window !== 'undefined') {
				const href = '/auth/login';

				axios
					.post(
						ENV.API.graphql_urL!,
						{
							query: print(LOGOUT_USER),
							operationName: 'LogoutUser',
							variables: {},
						},
						{
							withCredentials: true,
						},
					)
					.then(() => {
						if (window.location.pathname !== href) window.location.href = href;
					});
			}
		});
	}

	if (networkError) {
		// console.error(`[Network error]: ${networkError}`);
	}
});

const wsLink =
	typeof window !== 'undefined'
		? new GraphQLWsLink(
				createClient({
					url: ENV.API.graphql_ws_url!,
					retryAttempts: Infinity,
				}),
		  )
		: null;

const link =
	typeof window !== 'undefined' && wsLink
		? split(
				({ query }) => {
					const definition = getMainDefinition(query);
					return (
						definition.kind === 'OperationDefinition' &&
						definition.operation === 'subscription'
					);
				},
				wsLink,
				httpLink,
		  )
		: httpLink;

export const apolloLink = ApolloLink.from([
	errorMiddleware,
	operationNameMiddleware,
	link,
]);
