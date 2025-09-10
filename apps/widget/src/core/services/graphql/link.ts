import { ENV } from '@/core/config/env';
import { ApolloLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createUploadLink } from 'apollo-upload-client';
import { createClient } from 'graphql-ws';

const httpLink = createUploadLink({
	uri: ENV.API.graphql_url!,
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

export const apolloLink = ApolloLink.from([operationNameMiddleware, link]);
