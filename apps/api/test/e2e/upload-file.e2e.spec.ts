import * as path from 'path';
import { ENV } from 'src/config/env';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { UPLOAD_FILE } from 'test/shared/gql/private/file';
import { UploadFileMutation } from 'test/shared/test-gql-private-api-schema.ts';

jest.setTimeout(30000);

describe('UploadFile', () => {
	let environment: TestEnvironment;

	beforeAll(async () => {
		environment = await setupTestEnvironment();
	});

	afterAll(async () => {
		await environment.close();
	});

	it('uploads', async () => {
		const { data } = await environment.privateApiClient.uploadFile<UploadFileMutation>(
			UPLOAD_FILE,
			path.join(process.cwd(), 'test', 'mocks', 'image-example.png'),
		);

		expect(data.uploadFile[0]).toEqual({
			id: expect.any(String),
			width: 200,
			height: 150,
			url: expect.stringContaining(ENV.DIRECTUS.url!),
		});
	});
});
