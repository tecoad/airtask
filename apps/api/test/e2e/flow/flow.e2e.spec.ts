import { UnauthorizedException } from '@nestjs/common';
import { flow_agent, flow_contact_segment, user } from '@prisma/client';
import { AccountRole, AccountUsageKind, FlowAgentEditorType } from 'src/graphql';
import { UserNotAAccountMemberError } from 'src/shared/errors';
import { UserNotAccountManagerError } from 'src/shared/errors/user-not-the-account-owner.error';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import {
	ACCOUNT_FLOW,
	ACCOUNT_FLOWS,
	CREATE_FLOW,
	DELETE_FLOW,
	UPDATE_FLOW,
} from 'test/shared/gql/private/flow';
import {
	AccountFlowQuery,
	AccountFlowQueryVariables,
	AccountFlowsQuery,
	AccountFlowsQueryVariables,
	CreateFlowInput,
	CreateFlowMutation,
	CreateFlowMutationVariables,
	DeleteFlowMutation,
	DeleteFlowMutationVariables,
	FlowFragment,
	FlowStatus,
	FlowType,
	UpdateFlowInput,
	UpdateFlowMutation,
	UpdateFlowMutationVariables,
} from 'test/shared/test-gql-private-api-schema.ts';
import { createUserAsAccountMember } from 'test/shared/utils/create-user-as-account-member';
import { UserWithAccounts } from 'test/shared/utils/create-user-as-account-owner';
import { createUserAsAccountMemberWithSubscription } from 'test/shared/utils/create-user-as-account-with-subscription-member';
import { createUserWithoutAccount } from 'test/shared/utils/create-user-without-account';
import { v4 } from 'uuid';

jest.setTimeout(40000);

describe('Flow', () => {
	let environment: TestEnvironment,
		userAccountOwner: UserWithAccounts,
		userAccountMember: UserWithAccounts,
		userWithouAccount: user,
		accountId: number,
		flowAgent: flow_agent,
		flowContactSegment: flow_contact_segment;

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		userAccountOwner = await createUserAsAccountMemberWithSubscription(environment, {
			accountUserInput: {
				role: AccountRole.owner,
			},
			subscriptionInput: {},
			subscriptionPlanInput: {
				name: 'Plan',
				allowed_modules: [AccountUsageKind.flow],
			},
		});

		accountId = userAccountOwner.account_user[0].account_id!;

		userAccountMember = await createUserAsAccountMember(environment, {
			accountConnectOrCreate: {
				where: {
					id: accountId,
				},
				create: {},
			},
		});
		userWithouAccount = await createUserWithoutAccount(environment);

		flowAgent = await environment.prisma.flow_agent.create({
			data: {
				id: v4(),
				account: accountId,
				editor_type: FlowAgentEditorType.advanced,
				title: 'Title',
			},
		});
		flowContactSegment = await environment.prisma.flow_contact_segment.create({
			data: {
				id: v4(),
				account: accountId,
				label: 'Label',
			},
		});
	});

	afterAll(async () => {
		await environment.close();
	});

	let createdItem: FlowFragment;
	let createInput: CreateFlowInput;

	describe('Create', () => {
		it('cant create flow without auth', async () => {
			createInput = {
				account: accountId,
				agent: flowAgent.id,
				segment: flowContactSegment.id,
				name: 'Name',
				type: FlowType.Outbound,
				daily_budget: 2.53,
				status: FlowStatus.Active,
			};

			await expect(
				environment.privateApiClient.query<
					CreateFlowMutation,
					CreateFlowMutationVariables
				>(CREATE_FLOW, {
					input: createInput,
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant create flow without account permission', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);
			await expect(
				environment.privateApiClient.query<
					CreateFlowMutation,
					CreateFlowMutationVariables
				>(CREATE_FLOW, {
					input: createInput,
				}),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('create as account owner', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			const { data } = await environment.privateApiClient.query<
				CreateFlowMutation,
				CreateFlowMutationVariables
			>(CREATE_FLOW, {
				input: createInput,
			});

			expect(data.createFlow).toEqual(<FlowFragment>{
				id: expect.any(String),
				name: createInput.name,
				type: createInput.type,
				segment: {
					id: flowContactSegment.id,
					label: flowContactSegment.label,
				},
				agent: {
					id: flowAgent.id,
					title: flowAgent.title,
					editor_type: flowAgent.editor_type,
					voice: flowAgent.voice,
					script: flowAgent.script,
					script_schema: flowAgent.script_schema,
					knowledge_base: null,
					date_created: expect.any(String),
					date_updated: null,
				},
				daily_budget: createInput.daily_budget,
				status: createInput.status,
			});

			createdItem = data.createFlow;
		});
	});

	describe('Read', () => {
		it('cant read item without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<AccountFlowQuery, AccountFlowQueryVariables>(
					ACCOUNT_FLOW,
					{ accountFlowId: createdItem.id },
				),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant read item without account member permission', async () => {
			environment.privateApiClient.authenticateAsUser(
				userWithouAccount.id,
				userWithouAccount.email,
			);

			await expect(
				environment.privateApiClient.query<AccountFlowQuery, AccountFlowQueryVariables>(
					ACCOUNT_FLOW,
					{ accountFlowId: createdItem.id },
				),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('read created item', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);

			const { data } = await environment.privateApiClient.query<
				AccountFlowQuery,
				AccountFlowQueryVariables
			>(ACCOUNT_FLOW, { accountFlowId: createdItem.id });

			expect(data.accountFlow).toEqual(createdItem);
		});

		it('cant read item on list without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<AccountFlowsQuery, AccountFlowsQueryVariables>(
					ACCOUNT_FLOWS,
					{ accountId },
				),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant read item on list without account member permission', async () => {
			environment.privateApiClient.authenticateAsUser(
				userWithouAccount.id,
				userWithouAccount.email,
			);

			await expect(
				environment.privateApiClient.query<AccountFlowsQuery, AccountFlowsQueryVariables>(
					ACCOUNT_FLOWS,
					{ accountId },
				),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('read created item on list', async () => {
			// auth for next suits
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);
			const { data } = await environment.privateApiClient.query<
				AccountFlowsQuery,
				AccountFlowsQueryVariables
			>(ACCOUNT_FLOWS, { accountId });

			expect(data.accountFlows).toEqual([createdItem]);
		});
	});

	let updateInput: UpdateFlowInput;

	describe('Update', () => {
		it('cant update item without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			updateInput = {
				id: createdItem.id,
				name: 'New name',
				agent: flowAgent.id,
				segment: flowContactSegment.id,
				daily_budget: 1.74,
				status: FlowStatus.Paused,
			};

			await expect(
				environment.privateApiClient.query<
					UpdateFlowMutation,
					UpdateFlowMutationVariables
				>(UPDATE_FLOW, {
					input: updateInput,
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant update item without account manager permission', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);

			await expect(
				environment.privateApiClient.query<
					UpdateFlowMutation,
					UpdateFlowMutationVariables
				>(UPDATE_FLOW, {
					input: {
						id: createdItem.id,
						name: 'New name',
					},
				}),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('update item', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			const { data } = await environment.privateApiClient.query<
				UpdateFlowMutation,
				UpdateFlowMutationVariables
			>(UPDATE_FLOW, {
				input: updateInput,
			});

			const { daily_budget, name, status } = updateInput;

			expect(data.updateFlow).toEqual(<FlowFragment>{
				...createdItem,
				daily_budget,
				name,
				status,
			});

			createdItem = data.updateFlow;
		});
	});

	describe('Delete', () => {
		it('cant delete item without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<
					DeleteFlowMutation,
					DeleteFlowMutationVariables
				>(DELETE_FLOW, {
					deleteFlowId: createdItem.id,
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant delete item without account manager permission', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);

			await expect(
				environment.privateApiClient.query<
					DeleteFlowMutation,
					DeleteFlowMutationVariables
				>(DELETE_FLOW, {
					deleteFlowId: createdItem.id,
				}),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('delete item', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			const { data } = await environment.privateApiClient.query<
				DeleteFlowMutation,
				DeleteFlowMutationVariables
			>(DELETE_FLOW, {
				deleteFlowId: createdItem.id,
			});

			expect(data.deleteFlow).toBe(true);

			// Still can find item in DB, because its a soft delete
			await environment.prisma.flow.findUniqueOrThrow({
				where: {
					id: String(createdItem.id),
				},
			});
		});

		it('cant find deleted item from API findUnique', async () => {
			const { data } = await environment.privateApiClient.query<
				AccountFlowQuery,
				AccountFlowQueryVariables
			>(ACCOUNT_FLOW, { accountFlowId: createdItem.id });

			expect(data.accountFlow).toBe(null);
		});

		it('cant find deleted item from api findMany', async () => {
			const { data } = await environment.privateApiClient.query<
				AccountFlowsQuery,
				AccountFlowsQueryVariables
			>(ACCOUNT_FLOWS, { accountId });

			expect(data.accountFlows).toHaveLength(0);
		});
	});
});
