import { ApolloClient, InMemoryCache } from '@apollo/client';
import { apolloLink } from './link';

export const apiClient = new ApolloClient({
	cache: new InMemoryCache(),
	link: apolloLink,
});
