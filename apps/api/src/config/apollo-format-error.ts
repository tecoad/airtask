import { ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import * as operationErrors from 'src/shared/errors';
import { ENV } from './env';

export const apolloFormatError: ApolloDriverConfig['formatError'] = (
	gqlError,
	err: GraphQLError,
) => {
	// We don't wanna to provide internal server errors details to the client in production
	if (ENV.isProd) {
		if (gqlError.extensions?.code === 'INTERNAL_SERVER_ERROR') {
			// If the error is an instance of any of the operation errors, return it
			for (const operationError of Object.values(operationErrors)) {
				if (err.originalError instanceof operationError) {
					if (gqlError.extensions?.stacktrace) {
						delete gqlError.extensions.stacktrace;
					}

					const formatted: GraphQLFormattedError = {
						message: gqlError.message,
						extensions: gqlError.extensions,
					};

					return formatted;
				}
			}

			console.log(err.originalError);

			const formatted: GraphQLFormattedError = {
				message: 'Internal server error',
			};

			return formatted;
		}
	}

	if (!ENV.isTesting) console.log(err);

	return gqlError;
};
