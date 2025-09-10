import { INestApplication, ModuleMetadata } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { adminApolloDriverConfig } from 'src/config/admin-apollo-driver.config';
import { privateApolloDriverConfig } from 'src/config/private-apollo-driver.config';
import { publicApolloDriverConfig } from 'src/config/public-apollo-driver.config';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { mockApp } from 'test/mocks/app';
import { TestingGraphqlClient } from './setup-gql-client';

export type TestEnvironment = {
	close: () => Promise<void>;
	publicApiClient: TestingGraphqlClient;
	privateApiClient: TestingGraphqlClient;
	adminApiClient: TestingGraphqlClient;
	app: INestApplication;
	httpClient: AxiosInstance;
	prisma: PrismaService;
};

let _app: INestApplication;

export const setupTestEnvironment = async (
	metadata?: ModuleMetadata,
): Promise<TestEnvironment> => {
	const app = _app ?? (await mockApp(metadata));
	_app = app;

	const prisma = app.get(PrismaService);

	const baseURL = (await app.getUrl()).replace('[::1]', 'localhost');
	const publicApiClient = new TestingGraphqlClient(
		baseURL + publicApolloDriverConfig.path,
	);
	const privateApiClient = new TestingGraphqlClient(
		baseURL + privateApolloDriverConfig.path,
	);
	const adminApiClient = new TestingGraphqlClient(baseURL + adminApolloDriverConfig.path);
	const httpClient = axios.create({
		baseURL,
	});

	return {
		close: () => {
			publicApiClient.wsClient.close();
			privateApiClient.wsClient.close();
			adminApiClient.wsClient.close();

			return app.close();
		},
		publicApiClient,
		privateApiClient,
		adminApiClient,
		prisma,
		app,
		httpClient,
	};
};
