import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	overwrite: true,
	generates: {
		'src/gql-schema.ts': {
			schema: 'http://localhost:3005/graphql',
			documents: ['src/*.ts'],
			plugins: ['typescript', 'typescript-operations'],
		},
	},
};

export default config;
