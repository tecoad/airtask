import axios, { AxiosInstance } from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { DocumentNode, print } from 'graphql';
import { GraphQLClient } from 'graphql-request';
import * as jwt from 'jsonwebtoken';
import { parse as setCookieParse } from 'set-cookie-parser';
import { ENV } from 'src/config/env';
import { UserJwtPayload } from 'src/modules/users/types';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import * as WebSocket from 'ws';

export class TestingGraphqlClient {
	private headers: Record<string, string> = {};
	requestCookies: Record<string, string>[] = [];

	axiosClient: AxiosInstance;
	client: GraphQLClient;
	wsClient: SubscriptionClient;

	constructor(private apiUrl = '') {
		this.axiosClient = axios.create({
			baseURL: apiUrl,
		});
		this.client = new GraphQLClient(apiUrl);
		this.wsClient = new SubscriptionClient(apiUrl.replace('http', 'ws'), {}, WebSocket);
	}

	authenticateAsUser(id: number, email: string) {
		const token = jwt.sign(
			<UserJwtPayload>{
				id,
				email,
				authenticatedAt: new Date().toISOString(),
			},
			ENV.USERS.jwt_token_secret!,
			{
				expiresIn: '1y',
			},
		);

		this.setAuthorizationToken(token);
	}

	setAuthorizationToken(token: string) {
		const name = 'Authorization',
			value = `Bearer ${token}`;
		this.client.setHeader(name, value);
		this.headers[name] = value;
		this.axiosClient.defaults.headers[name] = value;
	}

	deleteAuthorizationToken() {
		this.client.setHeader('Authorization', '');
		delete this.headers['Authorization'];
		delete this.axiosClient.defaults.headers['Authorization'];
	}

	async query<T = any, V extends Record<string, unknown> = Record<string, unknown>>(
		query: DocumentNode,
		variables?: V,
	) {
		try {
			const response = await this.client.rawRequest<T, V>(print(query), variables);

			const resCookies = setCookieParse(response.headers.get('set-cookie')).reduce(
				(acc, item) => {
					acc[item.name] = item.value;

					return acc;
				},
				{} as Record<string, string>,
			);

			if (resCookies) {
				this.requestCookies.push(resCookies);
			}

			return response;
		} catch (e) {
			throw new ClientError(e.response, { query: print(query), variables });
		}
	}

	get lastRequestCookies() {
		return this.requestCookies[this.requestCookies.length - 1];
	}

	async uploadFile<D, V = object>(
		query: DocumentNode,
		filePath: string,
		parameterName = 'file',
		variables?: V,
	) {
		// Definir a operação e mapeamento
		const operations = {
			query: print(query),
			variables: {
				...variables,
				[parameterName]: [null],
			},
			operationName: (
				query.definitions.find((item) => item.kind === 'OperationDefinition') as any
			).name?.value,
		};

		const map = {
			'0': [`variables.${parameterName}.0`],
		};

		// Crie uma nova instância FormData
		const data = new FormData();

		// Adicione a operação e mapeamento
		data.append('operations', JSON.stringify(operations));
		data.append('map', JSON.stringify(map));

		data.append('0', fs.createReadStream(filePath));

		// Faz a solicitação usando axios
		const response = await this.axiosClient.post<D>('', data, {
			headers: {
				...data.getHeaders(),
				'x-apollo-operation-name': 'UploadFile',
			},
		});

		if ((response.data as any).errors) {
			throw new ClientError(response.data, { query: print(query), variables });
		}

		return response.data as { data: D };
	}
}

export class ClientError extends Error {
	constructor(
		public response: any,
		public request: any,
	) {
		super(ClientError.extractMessage(response));
	}
	static extractMessage(response: any): string {
		if (response?.errors) {
			return response.errors[0].message;
		} else {
			return `GraphQL Error (Code: ${response?.status})`;
		}
	}
}
