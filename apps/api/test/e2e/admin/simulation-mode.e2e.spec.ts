import { faker } from '@faker-js/faker';
import { ForbiddenException } from '@nestjs/common';
import { user } from '@prisma/client';
import { Permissions } from 'src/admin-graphql';
import { CONSTANTS } from 'src/config/constants';
import { ENV } from 'src/config/env';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { START_SIMULATION_MODE } from 'test/shared/gql/admin/simulation-mode';
import { ACTIVE_USER, LOGOUT_USER } from 'test/shared/gql/private/user';
import {
	StartSimulationModeMutation,
	StartSimulationModeMutationVariables,
} from 'test/shared/test-gql-admin-api-schema';
import { ActiveUserQuery } from 'test/shared/test-gql-private-api-schema.ts';
import { createUserAsAccountOwner } from 'test/shared/utils/create-user-as-account-owner';

jest.setTimeout(30000);

describe('Admin Simulation Mode', () => {
	let environment: TestEnvironment;
	let userWithoutPermissions: user,
		focusUser: user,
		userWithAdminAtDatabase: user,
		adminUser: user;

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		userWithoutPermissions = await createUserAsAccountOwner(environment, {
			userInput: {
				permissions: undefined,
				email: faker.internet.email(),
				first_name: faker.name.firstName(),
				last_name: faker.name.lastName(),
			},
		});
		focusUser = await createUserAsAccountOwner(environment, {
			userInput: {
				permissions: undefined,
				email: faker.internet.email(),
				first_name: faker.name.firstName(),
				last_name: faker.name.lastName(),
			},
		});
		// SuperAdmin should only be recognized by the ENV, not by the database
		userWithAdminAtDatabase = await createUserAsAccountOwner(environment, {
			userInput: {
				permissions: [Permissions.SuperAdmin],
				email: faker.internet.email(),
				first_name: faker.name.firstName(),
				last_name: faker.name.lastName(),
			},
		});
		adminUser = await createUserAsAccountOwner(environment, {
			userInput: {
				permissions: undefined,
				email: faker.internet.email(),
				first_name: faker.name.firstName(),
				last_name: faker.name.lastName(),
			},
		});

		ENV.ADMIN.users_ids_with_super_admin = [adminUser.id.toString()];
	});

	it('cant startSimulationMode without SuperAdmin permission', async () => {
		environment.adminApiClient.authenticateAsUser(
			userWithoutPermissions.id,
			userWithoutPermissions.email,
		);

		// Here we test the error
		const promise = environment.adminApiClient.query<
			StartSimulationModeMutation,
			StartSimulationModeMutationVariables
		>(START_SIMULATION_MODE, {
			focusUserId: focusUser.id,
		});

		await expect(promise).rejects.toThrowError(new ForbiddenException().message);
	});

	it('cant startSimulationMode with SuperAdmin permission at database', async () => {
		environment.adminApiClient.authenticateAsUser(
			userWithAdminAtDatabase.id,
			userWithAdminAtDatabase.email,
		);

		// Here we test the error
		const promise = environment.adminApiClient.query<
			StartSimulationModeMutation,
			StartSimulationModeMutationVariables
		>(START_SIMULATION_MODE, {
			focusUserId: focusUser.id,
		});

		await expect(promise).rejects.toThrowError(new ForbiddenException().message);
	});

	it('login as admin and see active user', async () => {
		environment.privateApiClient.authenticateAsUser(adminUser.id, adminUser.email);
		environment.adminApiClient.authenticateAsUser(adminUser.id, adminUser.email);

		const { data } =
			await environment.privateApiClient.query<ActiveUserQuery>(ACTIVE_USER);

		expect(data.activeUser?.id).toBe(adminUser.id.toString());
	});

	it('start simulation mode with admin account', async () => {
		const { data } = await environment.adminApiClient.query<
			StartSimulationModeMutation,
			StartSimulationModeMutationVariables
		>(START_SIMULATION_MODE, {
			focusUserId: focusUser.id,
		});

		expect(data.startSimulationMode?.id).toBe(focusUser.id.toString());

		environment.privateApiClient.setAuthorizationToken(
			environment.adminApiClient.lastRequestCookies[CONSTANTS.USERS.cookie_name],
		);
	});

	it('then see active user as focused user', async () => {
		const { data } =
			await environment.privateApiClient.query<ActiveUserQuery>(ACTIVE_USER);

		expect(data.activeUser?.id).toBe(focusUser.id.toString());
	});

	it('exit simulation mode', async () => {
		await environment.privateApiClient.query(LOGOUT_USER);

		// Set authorization token the response of logout
		environment.privateApiClient.setAuthorizationToken(
			environment.privateApiClient.lastRequestCookies[CONSTANTS.USERS.cookie_name],
		);

		// See active user as admin user again
		const { data } =
			await environment.privateApiClient.query<ActiveUserQuery>(ACTIVE_USER);

		expect(data.activeUser?.id).toBe(adminUser.id.toString());
	});
});
