import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	overwrite: true,
	generates: {
		'src/core/shared/gql-api-schema.ts': {
			schema: 'http://localhost:3005/app-graphql',
			documents: [
				'src/**/api-gql.ts',
				'src/**/api-fragments.ts',
				'src/**/shared-fragments.ts',
			],
			plugins: ['typescript', 'typescript-operations'],
		},
		'src/core/shared/admin-gql-api-schema.ts': {
			schema: 'http://localhost:3005/admin-graphql',
			documents: [
				'src/**/admin-gql.ts',
				'src/**/admin-fragments.ts',
				'src/**/shared-fragments.ts',
			],
			plugins: ['typescript', 'typescript-operations'],
		},
		'src/core/shared/public-gql-api-schema.ts': {
			schema: 'http://localhost:3005/graphql',
			documents: [
				'src/**/public-gql.ts',
				'src/**/public-fragments.ts',
				'src/**/shared-fragments.ts',
			],
			plugins: ['typescript', 'typescript-operations'],
		},
	},
};

export default config;
