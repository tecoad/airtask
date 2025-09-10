import type { CodegenConfig } from '@graphql-codegen/cli';
import * as dotenv from 'dotenv';
import { ENV } from './src/config/env';
dotenv.config();

const config: CodegenConfig = {
  overwrite: true,
  config: {
    scalars: {
      ID: 'string | number',
    },
  },
  generates: {
    'test/shared/test-gql-private-api-schema.ts.ts': {
      schema: `http://localhost:${ENV.PORT}/app-graphql`,
      documents: [
        'test/shared/gql/private/*.ts',
        'test/shared/gql/shared/*.ts',
      ],
      plugins: ['typescript', 'typescript-operations'],
    },
    'test/shared/test-gql-public-api-schema.ts': {
      schema: `http://localhost:${ENV.PORT}/graphql`,
      documents: ['test/shared/gql/public/*.ts', 'test/shared/gql/shared/*.ts'],
      plugins: ['typescript', 'typescript-operations'],
    },
    'test/shared/test-gql-admin-api-schema.ts': {
      schema: `http://localhost:${ENV.PORT}/admin-graphql`,
      documents: ['test/shared/gql/admin/*.ts', 'test/shared/gql/shared/*.ts'],
      plugins: ['typescript', 'typescript-operations'],
    },
  },
};

export default config;
