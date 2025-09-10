import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import * as path from 'path';
import { PublicApiModule } from 'src/modules/api/public/public.module';
import { SharedApiModule } from 'src/modules/api/shared/shared.module';
import { extractIpFromRequest } from 'src/shared/decorators';
import { apolloFormatError } from './apollo-format-error';

export const publicApolloDriverConfig: ApolloDriverConfig = {
	driver: ApolloDriver,
	typePaths: [
		'./src/modules/api/public/**/*.graphql',
		'./src/modules/api/shared/**/*.graphql',
	],
	path: '/graphql',
	include: [PublicApiModule, SharedApiModule],
	definitions: {
		path: path.join(process.cwd(), 'src/public-graphql.ts'),
		outputAs: 'interface',
	},
	playground: true,
	context: ({ req, res }) => ({ req, res, ip: extractIpFromRequest(req) }),
	cache: new InMemoryLRUCache({
		// 5 minutes (in milliseconds)
		ttl: 300_000,
	}),
	formatError: apolloFormatError,
	subscriptions: {
		'graphql-ws': true,
		'subscriptions-transport-ws': true,
	},
	introspection: true,
};
