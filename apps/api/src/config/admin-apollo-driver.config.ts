import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import * as path from 'path';
import { AdminApiModule } from 'src/modules/api/admin/admin.module';
import { SharedApiModule } from 'src/modules/api/shared/shared.module';
import { extractIpFromRequest } from 'src/shared/decorators';
import { apolloFormatError } from './apollo-format-error';

export const adminApolloDriverConfig: ApolloDriverConfig = {
	driver: ApolloDriver,
	typePaths: [
		'./src/modules/api/admin/**/*.graphql',
		'./src/modules/api/shared/**/*.graphql',
	],
	path: '/admin-graphql',
	include: [AdminApiModule, SharedApiModule],
	definitions: {
		path: path.join(process.cwd(), 'src/admin-graphql.ts'),
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
