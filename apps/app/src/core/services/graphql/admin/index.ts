import { ENV } from '@/core/config/env';
import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

const httpLink = createUploadLink({
	uri: ENV.API.admin_graphql_url,
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

export const adminClient = new ApolloClient({
	cache: new InMemoryCache(),
	link: ApolloLink.from([operationNameMiddleware, httpLink]),
});
