import * as dotenv from 'dotenv';
const cfg = dotenv.config();

import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	overwrite: true,
	generates: {
		'src/core/shared/api-gql-schema.ts': {
			schema: cfg.parsed?.['NEXT_PUBLIC_API_GRAPHQL_URL'],
			documents: ['src/**/api-gql.ts', 'src/**/api-fragments.ts'],
			plugins: ['typescript', 'typescript-operations'],
		},
	},
};

export default config;
