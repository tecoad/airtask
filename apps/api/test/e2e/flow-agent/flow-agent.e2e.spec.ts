import { UnauthorizedException } from '@nestjs/common';
import { knowledge_base } from '@prisma/client';
import { AccountRole, AccountUsageKind, KnowledgeBaseType } from 'src/graphql';
import { UserNotAAccountMemberError } from 'src/shared/errors';
import { UserNotAccountManagerError } from 'src/shared/errors/user-not-the-account-owner.error';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import {
	ACCOUNT_FLOW_AGENT,
	ACCOUNT_FLOW_AGENTS,
	CREATE_FLOW_AGENT,
	DELETE_FLOW_AGENT,
	UPDATE_FLOW_AGENT,
} from 'test/shared/gql/private/flow-agent';
import {
	AccountFlowAgentQuery,
	AccountFlowAgentQueryVariables,
	AccountFlowAgentsQuery,
	AccountFlowAgentsQueryVariables,
	CreateFlowAgentInput,
	CreateFlowAgentMutation,
	CreateFlowAgentMutationVariables,
	DeleteFlowAgentMutation,
	DeleteFlowAgentMutationVariables,
	FlowAgentEditorType,
	FlowAgentFragment,
	FlowAgentVoice,
	UpdateFlowAgentInput,
	UpdateFlowAgentMutation,
	UpdateFlowAgentMutationVariables,
} from 'test/shared/test-gql-private-api-schema.ts';
import { createUserAsAccountMember } from 'test/shared/utils/create-user-as-account-member';
import { UserWithAccounts } from 'test/shared/utils/create-user-as-account-owner';
import { createUserAsAccountMemberWithSubscription } from 'test/shared/utils/create-user-as-account-with-subscription-member';
import { v4 } from 'uuid';

jest.setTimeout(40000);

describe('Flow Agent', () => {
	let environment: TestEnvironment,
		userAccountOwner: UserWithAccounts,
		userAccountMember: UserWithAccounts,
		userIntoAnotherAccount: UserWithAccounts,
		accountId: number,
		knowledBase: knowledge_base,
		secondKnowledBase: knowledge_base,
		knowledBaseForAnotherAccount: knowledge_base;

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
		userIntoAnotherAccount = await createUserAsAccountMemberWithSubscription(
			environment,
			{
				accountUserInput: {
					role: AccountRole.owner,
				},
				subscriptionInput: {},
				subscriptionPlanInput: {
					name: 'Plan',
					allowed_modules: [AccountUsageKind.flow],
				},
			},
		);
		const anotherAccountId = userIntoAnotherAccount.account_user[0].account_id!;

		knowledBase = await environment.prisma.knowledge_base.create({
			data: {
				id: v4(),
				title: 'Title',
				type: KnowledgeBaseType.qa,
				account: accountId,
			},
		});
		secondKnowledBase = await environment.prisma.knowledge_base.create({
			data: {
				id: v4(),
				title: 'Title',
				type: KnowledgeBaseType.qa,
				account: accountId,
			},
		});

		knowledBaseForAnotherAccount = await environment.prisma.knowledge_base.create({
			data: {
				id: v4(),
				title: 'Title',
				type: KnowledgeBaseType.qa,
				account: anotherAccountId,
			},
		});
	});

	afterAll(async () => {
		await environment.close();
	});

	let createInput: CreateFlowAgentInput;
	let updateInput: UpdateFlowAgentInput;
	let createdItem: FlowAgentFragment;

	describe('Create', () => {
		it('cant create flow agent without auth', async () => {
			createInput = {
				title: 'Title',
				account: accountId,
				editor_type: FlowAgentEditorType.Advanced,
				voice: FlowAgentVoice.Female,
				script: 'script',
			};

			await expect(
				environment.privateApiClient.query<
					CreateFlowAgentMutation,
					CreateFlowAgentMutationVariables
				>(CREATE_FLOW_AGENT, {
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
					CreateFlowAgentMutation,
					CreateFlowAgentMutationVariables
				>(CREATE_FLOW_AGENT, {
					input: createInput,
				}),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('cant create with knowledbase for another account', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			createInput.knowledge_base = knowledBaseForAnotherAccount.id;

			await expect(
				environment.privateApiClient.query<
					CreateFlowAgentMutation,
					CreateFlowAgentMutationVariables
				>(CREATE_FLOW_AGENT, {
					input: createInput,
				}),
			).rejects.toThrowError('knowledBase-must-be-from-the-same-account');
		});

		it('create as account owner', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			createInput.knowledge_base = knowledBase.id;

			const { data } = await environment.privateApiClient.query<
				CreateFlowAgentMutation,
				CreateFlowAgentMutationVariables
			>(CREATE_FLOW_AGENT, {
				input: createInput,
			});

			expect(data.createFlowAgent).toEqual(<FlowAgentFragment>{
				id: expect.any(String),
				title: createInput.title,
				editor_type: createInput.editor_type,
				script_schema: null,
				voice: createInput.voice,
				script: createInput.script,
				date_created: expect.any(String),
				date_updated: null,
				knowledge_base: expect.objectContaining(<
					Partial<FlowAgentFragment['knowledge_base']>
				>{
					id: knowledBase.id,
					title: knowledBase.title,
					type: knowledBase.type,
				}),
			});

			createdItem = data.createFlowAgent;
		});
	});

	describe('Read', () => {
		it('cant read item without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<
					AccountFlowAgentQuery,
					AccountFlowAgentQueryVariables
				>(ACCOUNT_FLOW_AGENT, { accountFlowAgentId: createdItem.id }),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant read item without account member permission', async () => {
			environment.privateApiClient.authenticateAsUser(
				userIntoAnotherAccount.id,
				userIntoAnotherAccount.email,
			);

			await expect(
				environment.privateApiClient.query<
					AccountFlowAgentQuery,
					AccountFlowAgentQueryVariables
				>(ACCOUNT_FLOW_AGENT, { accountFlowAgentId: createdItem.id }),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('read created item', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);

			const { data } = await environment.privateApiClient.query<
				AccountFlowAgentQuery,
				AccountFlowAgentQueryVariables
			>(ACCOUNT_FLOW_AGENT, { accountFlowAgentId: createdItem.id });

			expect(data.accountFlowAgent).toEqual(createdItem);
		});

		it('cant read item on list without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<
					AccountFlowAgentsQuery,
					AccountFlowAgentsQueryVariables
				>(ACCOUNT_FLOW_AGENTS, { account: accountId }),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant read item on list without account member permission', async () => {
			environment.privateApiClient.authenticateAsUser(
				userIntoAnotherAccount.id,
				userIntoAnotherAccount.email,
			);

			await expect(
				environment.privateApiClient.query<
					AccountFlowAgentsQuery,
					AccountFlowAgentsQueryVariables
				>(ACCOUNT_FLOW_AGENTS, { account: accountId }),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('read created item on list', async () => {
			// auth for next suits
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);
			const { data } = await environment.privateApiClient.query<
				AccountFlowAgentsQuery,
				AccountFlowAgentsQueryVariables
			>(ACCOUNT_FLOW_AGENTS, { account: accountId });

			expect(data.accountFlowAgents).toEqual([createdItem]);
		});
	});

	describe('Update', () => {
		it('cant update item without auth', async () => {
			updateInput = {
				id: createdItem.id,
				title: 'Title2',
				editor_type: FlowAgentEditorType.Form,
				voice: FlowAgentVoice.Male,
				script: 'script2',
				script_schema: {
					schema: 'schema',
				},
			};

			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<
					UpdateFlowAgentMutation,
					UpdateFlowAgentMutationVariables
				>(UPDATE_FLOW_AGENT, {
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
					UpdateFlowAgentMutation,
					UpdateFlowAgentMutationVariables
				>(UPDATE_FLOW_AGENT, {
					input: updateInput,
				}),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('cant update item with knowledbase for another account', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			updateInput.knowledge_base = knowledBaseForAnotherAccount.id;

			await expect(
				environment.privateApiClient.query<
					UpdateFlowAgentMutation,
					UpdateFlowAgentMutationVariables
				>(UPDATE_FLOW_AGENT, {
					input: updateInput,
				}),
			).rejects.toThrowError('knowledBase-must-be-from-the-same-account');
		});

		it('update item', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			updateInput.knowledge_base = secondKnowledBase.id;

			const { data } = await environment.privateApiClient.query<
				UpdateFlowAgentMutation,
				UpdateFlowAgentMutationVariables
			>(UPDATE_FLOW_AGENT, {
				input: updateInput,
			});

			expect(data.updateFlowAgent).toEqual(<FlowAgentFragment>{
				...createdItem,
				...updateInput,
				knowledge_base: expect.objectContaining(<
					Partial<FlowAgentFragment['knowledge_base']>
				>{
					id: secondKnowledBase.id,
					title: secondKnowledBase.title,
					type: secondKnowledBase.type,
				}),
				date_updated: expect.any(String),
			});

			createdItem = data.updateFlowAgent;
		});
	});

	describe('Delete', () => {
		it('cant delete item without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<
					DeleteFlowAgentMutation,
					DeleteFlowAgentMutationVariables
				>(DELETE_FLOW_AGENT, {
					deleteFlowAgentId: createdItem.id,
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
					DeleteFlowAgentMutation,
					DeleteFlowAgentMutationVariables
				>(DELETE_FLOW_AGENT, {
					deleteFlowAgentId: createdItem.id,
				}),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('delete item', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			const { data } = await environment.privateApiClient.query<
				DeleteFlowAgentMutation,
				DeleteFlowAgentMutationVariables
			>(DELETE_FLOW_AGENT, {
				deleteFlowAgentId: createdItem.id,
			});

			expect(data.deleteFlowAgent).toBe(true);

			// Still can find item in DB, because its a soft delete
			await environment.prisma.flow_agent.findUniqueOrThrow({
				where: {
					id: String(createdItem.id),
				},
			});
		});

		it('cant find deleted item from API findUnique', async () => {
			const { data } = await environment.privateApiClient.query<
				AccountFlowAgentQuery,
				AccountFlowAgentQueryVariables
			>(ACCOUNT_FLOW_AGENT, { accountFlowAgentId: createdItem.id });

			expect(data.accountFlowAgent).toBe(null);
		});

		it('cant find deleted item from api findMany', async () => {
			const { data } = await environment.privateApiClient.query<
				AccountFlowAgentsQuery,
				AccountFlowAgentsQueryVariables
			>(ACCOUNT_FLOW_AGENTS, { account: accountId });

			expect(data.accountFlowAgents).toHaveLength(0);
		});
	});
});
