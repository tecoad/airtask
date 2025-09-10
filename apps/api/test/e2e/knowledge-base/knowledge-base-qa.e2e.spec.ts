import { UnauthorizedException } from '@nestjs/common';
import { user } from '@prisma/client';
import { AccountRole } from 'src/graphql';
import { UserNotAAccountMemberError } from 'src/shared/errors';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import {
	CREATE_KNOWLEDGE_BASE,
	CREATE_KNOWLEDGE_BASE_QA,
	DELETE_KNOWLEDGE_BASE_QA,
	KNOWLEDGE_BASE,
	KNOWLEDGE_BASE_QA,
	UPDATE_KNOWLEDGE_BASE_QA,
} from 'test/shared/gql/private/knowledge-base';
import {
	CreateKnowledgeBaseMutation,
	CreateKnowledgeBaseMutationVariables,
	CreateKnowledgeBaseQaInput,
	CreateKnowledgeBaseQaMutation,
	CreateKnowledgeBaseQaMutationVariables,
	DeleteKnowledgeBaseQaMutation,
	DeleteKnowledgeBaseQaMutationVariables,
	KnowledgeBaseFragment,
	KnowledgeBaseQaFragment,
	KnowledgeBaseQaQuery,
	KnowledgeBaseQaQueryVariables,
	KnowledgeBaseQaWithBasesFragment,
	KnowledgeBaseQuery,
	KnowledgeBaseQueryVariables,
	KnowledgeBaseType,
	KnowledgeBaseWithoutQaFragment,
	UpdateKnowledgeBaseQaInput,
	UpdateKnowledgeBaseQaMutation,
	UpdateKnowledgeBaseQaMutationVariables,
} from 'test/shared/test-gql-private-api-schema.ts';
import { createAccountWithSubscription } from 'test/shared/utils/create-account-with-subscription';
import { UserWithAccounts } from 'test/shared/utils/create-user-as-account-owner';
import { createUserAsAccountMemberWithSubscription } from 'test/shared/utils/create-user-as-account-with-subscription-member';
import { createUserWithoutAccount } from 'test/shared/utils/create-user-without-account';

describe('KnowledgeBase', () => {
	let environment: TestEnvironment,
		accountId: number,
		secondaryAccountId: number,
		userOwnerIntoAccounts: UserWithAccounts,
		userWithoutAccounts: user,
		knowledBases: [KnowledgeBaseFragment, KnowledgeBaseFragment];

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		userOwnerIntoAccounts = await createUserAsAccountMemberWithSubscription(environment, {
			accountUserInput: {
				role: AccountRole.owner,
			},
			subscriptionInput: {},
			subscriptionPlanInput: {
				name: 'Plan',
			},
		});
		accountId = userOwnerIntoAccounts.account_user[0].account_id!;

		const secondAccount = await createAccountWithSubscription(environment);

		secondaryAccountId = secondAccount.account.id;
		// Add user to second account
		await environment.prisma.account_user.create({
			data: {
				role: AccountRole.owner,
				account: {
					connect: {
						id: secondaryAccountId,
					},
				},
				user: {
					connect: {
						id: userOwnerIntoAccounts.id,
					},
				},
			},
		});

		userWithoutAccounts = await createUserWithoutAccount(environment);

		environment.privateApiClient.authenticateAsUser(
			userOwnerIntoAccounts.id,
			userOwnerIntoAccounts.email,
		);

		knowledBases = [
			(
				await environment.privateApiClient.query<
					CreateKnowledgeBaseMutation,
					CreateKnowledgeBaseMutationVariables
				>(CREATE_KNOWLEDGE_BASE, {
					accountId: accountId,
					input: {
						title: 'Title',
						type: KnowledgeBaseType.Qa,
					},
				})
			).data.createKnowledgeBase,
			(
				await environment.privateApiClient.query<
					CreateKnowledgeBaseMutation,
					CreateKnowledgeBaseMutationVariables
				>(CREATE_KNOWLEDGE_BASE, {
					accountId: accountId,
					input: {
						title: 'Title2',
						type: KnowledgeBaseType.Qa,
					},
				})
			).data.createKnowledgeBase,
		];
	});

	afterAll(async () => {
		await environment.close();
	});

	let createKnowledgeBaseQAInput: CreateKnowledgeBaseQaInput[];
	let createdKnowledBasesQA: [KnowledgeBaseQaFragment, KnowledgeBaseQaFragment];

	describe('Create Q&A', () => {
		it('cant create without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			createKnowledgeBaseQAInput = [
				{
					question: 'Question',
					answer: 'Answer',
					knowledge_base_id: [knowledBases[0].id],
				},
			];

			await expect(
				environment.privateApiClient.query<
					CreateKnowledgeBaseQaMutation,
					CreateKnowledgeBaseQaMutationVariables
				>(CREATE_KNOWLEDGE_BASE_QA, {
					input: createKnowledgeBaseQAInput,
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant create without been a account member', async () => {
			environment.privateApiClient.authenticateAsUser(
				userWithoutAccounts.id,
				userWithoutAccounts.email,
			);

			await expect(
				environment.privateApiClient.query<
					CreateKnowledgeBaseQaMutation,
					CreateKnowledgeBaseQaMutationVariables
				>(CREATE_KNOWLEDGE_BASE_QA, {
					input: createKnowledgeBaseQAInput,
				}),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('cant create with knowledge bases from different accounts', async () => {
			environment.privateApiClient.authenticateAsUser(
				userOwnerIntoAccounts.id,
				userOwnerIntoAccounts.email,
			);

			// Create knowledge base in another account
			const knowledgeBaseInAnotherAccount = await environment.privateApiClient.query<
				CreateKnowledgeBaseMutation,
				CreateKnowledgeBaseMutationVariables
			>(CREATE_KNOWLEDGE_BASE, {
				accountId: secondaryAccountId,
				input: {
					title: 'Title3',
					type: KnowledgeBaseType.Qa,
				},
			});

			createKnowledgeBaseQAInput = [
				{
					question: 'Question',
					answer: 'Answer',
					knowledge_base_id: [
						knowledBases[0].id,
						knowledgeBaseInAnotherAccount.data.createKnowledgeBase.id,
					],
				},
			];

			await expect(
				environment.privateApiClient.query<
					CreateKnowledgeBaseQaMutation,
					CreateKnowledgeBaseQaMutationVariables
				>(CREATE_KNOWLEDGE_BASE_QA, {
					input: createKnowledgeBaseQAInput,
				}),
			).rejects.toThrowError('error.found-knowledge-bases-with-different-accounts');
		});

		it('cant create with knowledge bases from different accounts with diff format of input', async () => {
			environment.privateApiClient.authenticateAsUser(
				userOwnerIntoAccounts.id,
				userOwnerIntoAccounts.email,
			);

			// Create knowledge base in another account
			const knowledgeBaseInAnotherAccount = await environment.privateApiClient.query<
				CreateKnowledgeBaseMutation,
				CreateKnowledgeBaseMutationVariables
			>(CREATE_KNOWLEDGE_BASE, {
				accountId: secondaryAccountId,
				input: {
					title: 'Title3',
					type: KnowledgeBaseType.Qa,
				},
			});

			createKnowledgeBaseQAInput = [
				{
					question: 'Question',
					answer: 'Answer',
					knowledge_base_id: [knowledBases[0].id],
				},
				{
					question: 'Question',
					answer: 'Answer',
					knowledge_base_id: [knowledgeBaseInAnotherAccount.data.createKnowledgeBase.id],
				},
			];

			await expect(
				environment.privateApiClient.query<
					CreateKnowledgeBaseQaMutation,
					CreateKnowledgeBaseQaMutationVariables
				>(CREATE_KNOWLEDGE_BASE_QA, {
					input: createKnowledgeBaseQAInput,
				}),
			).rejects.toThrowError('error.found-knowledge-bases-with-different-accounts');
		});

		it('create', async () => {
			environment.privateApiClient.authenticateAsUser(
				userOwnerIntoAccounts.id,
				userOwnerIntoAccounts.email,
			);

			// First QA is on both knowledge bases, second QA is only on the first one
			createKnowledgeBaseQAInput = [
				{
					question: 'Question',
					answer: 'Answer',
					knowledge_base_id: [knowledBases[0].id, knowledBases[1].id],
				},
				{
					question: 'Question2',
					answer: 'Answer3',
					knowledge_base_id: [knowledBases[0].id],
				},
			];

			const result = await environment.privateApiClient.query<
				CreateKnowledgeBaseQaMutation,
				CreateKnowledgeBaseQaMutationVariables
			>(CREATE_KNOWLEDGE_BASE_QA, {
				input: createKnowledgeBaseQAInput,
			});

			expect(result.data.createKnowledgeBaseQA).toEqual(<
				KnowledgeBaseQaWithBasesFragment[]
			>[
				{
					id: expect.any(String),
					question: createKnowledgeBaseQAInput[0].question,
					answer: createKnowledgeBaseQAInput[0].answer,
					knowledge_base: [
						{
							id: knowledBases[0].id,
							title: knowledBases[0].title,
							type: knowledBases[0].type,
							date_created: knowledBases[0].date_created,
							date_updated: knowledBases[0].date_updated,
						},
						{
							id: knowledBases[1].id,
							title: knowledBases[1].title,
							type: knowledBases[1].type,
							date_created: knowledBases[1].date_created,
							date_updated: knowledBases[1].date_updated,
						},
					],
					date_updated: null,
					date_created: expect.any(String),
				},
				{
					id: expect.any(String),
					question: createKnowledgeBaseQAInput[1].question,
					answer: createKnowledgeBaseQAInput[1].answer,
					knowledge_base: [
						{
							id: knowledBases[0].id,
							title: knowledBases[0].title,
							type: knowledBases[0].type,
							date_created: knowledBases[0].date_created,
							date_updated: knowledBases[0].date_updated,
						},
					],
					date_updated: null,
					date_created: expect.any(String),
				},
			]);

			createdKnowledBasesQA = [
				result.data.createKnowledgeBaseQA[0],
				result.data.createKnowledgeBaseQA[1],
			];
		});
	});

	describe('Update knowledgBaseQA', () => {
		let updateInput: UpdateKnowledgeBaseQaInput;

		it('cant update without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			updateInput = {
				id: createdKnowledBasesQA[0].id,
				answer: 'Answer2',
				question: 'Question2',
			};

			await expect(
				environment.privateApiClient.query<
					UpdateKnowledgeBaseQaMutation,
					UpdateKnowledgeBaseQaMutationVariables
				>(UPDATE_KNOWLEDGE_BASE_QA, {
					input: updateInput,
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant update without been a account member', async () => {
			environment.privateApiClient.authenticateAsUser(
				userWithoutAccounts.id,
				userWithoutAccounts.email,
			);

			await expect(
				environment.privateApiClient.query<
					UpdateKnowledgeBaseQaMutation,
					UpdateKnowledgeBaseQaMutationVariables
				>(UPDATE_KNOWLEDGE_BASE_QA, {
					input: updateInput,
				}),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('update', async () => {
			environment.privateApiClient.authenticateAsUser(
				userOwnerIntoAccounts.id,
				userOwnerIntoAccounts.email,
			);

			const result = await environment.privateApiClient.query<
				UpdateKnowledgeBaseQaMutation,
				UpdateKnowledgeBaseQaMutationVariables
			>(UPDATE_KNOWLEDGE_BASE_QA, {
				input: updateInput,
			});

			expect(result.data.updateKnowledgeBaseQA).toEqual(<KnowledgeBaseQaFragment>{
				...createdKnowledBasesQA[0],
				...updateInput,
				date_updated: expect.any(String),
			});

			createdKnowledBasesQA[0] = result.data.updateKnowledgeBaseQA;
		});

		it('remove from knowledge base', async () => {
			const result = await environment.privateApiClient.query<
				UpdateKnowledgeBaseQaMutation,
				UpdateKnowledgeBaseQaMutationVariables
			>(UPDATE_KNOWLEDGE_BASE_QA, {
				input: {
					...updateInput,
					knowledge_base_id: [knowledBases[0].id],
				},
			});

			createdKnowledBasesQA[0] = result.data.updateKnowledgeBaseQA;

			const read = await environment.privateApiClient.query<
				KnowledgeBaseQaQuery,
				KnowledgeBaseQaQueryVariables
			>(KNOWLEDGE_BASE_QA, {
				knowledgeBaseQaId: createdKnowledBasesQA[1].id,
			});

			expect(read.data.knowledgeBaseQA?.knowledge_base).toEqual(<
				KnowledgeBaseWithoutQaFragment[]
			>[
				{
					id: knowledBases[0].id,
					title: knowledBases[0].title,
					type: knowledBases[0].type,
					date_created: knowledBases[0].date_created,
					date_updated: knowledBases[0].date_updated,
				},
			]);
		});

		it('add to knowledge base', async () => {
			// now is only present in the first knowledge base.
			// will be added to the second one
			const result = await environment.privateApiClient.query<
				UpdateKnowledgeBaseQaMutation,
				UpdateKnowledgeBaseQaMutationVariables
			>(UPDATE_KNOWLEDGE_BASE_QA, {
				input: {
					...updateInput,
					knowledge_base_id: [knowledBases[0].id, knowledBases[1].id],
				},
			});

			createdKnowledBasesQA[0] = result.data.updateKnowledgeBaseQA;

			const read = await environment.privateApiClient.query<
				KnowledgeBaseQaQuery,
				KnowledgeBaseQaQueryVariables
			>(KNOWLEDGE_BASE_QA, {
				knowledgeBaseQaId: createdKnowledBasesQA[0].id,
			});

			expect(read.data.knowledgeBaseQA?.knowledge_base).toEqual(<
				KnowledgeBaseQaWithBasesFragment['knowledge_base']
			>[
				{
					id: knowledBases[0].id,
					title: knowledBases[0].title,
					type: knowledBases[0].type,
					date_created: knowledBases[0].date_created,
					date_updated: knowledBases[0].date_updated,
				},
				{
					id: knowledBases[1].id,
					title: knowledBases[1].title,
					type: knowledBases[1].type,
					date_created: knowledBases[1].date_created,
					date_updated: knowledBases[1].date_updated,
				},
			]);
		});
	});

	describe('Delete Q&A', () => {
		it('cant delete without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<
					DeleteKnowledgeBaseQaMutation,
					DeleteKnowledgeBaseQaMutationVariables
				>(DELETE_KNOWLEDGE_BASE_QA, {
					deleteKnowledgeBaseQaId: [createdKnowledBasesQA[1].id],
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant delete without been a member of account', async () => {
			environment.privateApiClient.authenticateAsUser(
				userWithoutAccounts.id,
				userWithoutAccounts.email,
			);

			await expect(
				environment.privateApiClient.query<
					DeleteKnowledgeBaseQaMutation,
					DeleteKnowledgeBaseQaMutationVariables
				>(DELETE_KNOWLEDGE_BASE_QA, {
					deleteKnowledgeBaseQaId: [createdKnowledBasesQA[1].id],
				}),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('delete item', async () => {
			environment.privateApiClient.authenticateAsUser(
				userOwnerIntoAccounts.id,
				userOwnerIntoAccounts.email,
			);

			const result = await environment.privateApiClient.query<
				DeleteKnowledgeBaseQaMutation,
				DeleteKnowledgeBaseQaMutationVariables
			>(DELETE_KNOWLEDGE_BASE_QA, {
				deleteKnowledgeBaseQaId: [createdKnowledBasesQA[1].id],
			});

			expect(result.data.deleteKnowledgeBaseQA).toEqual(true);

			// Find firstKnowledgeBase again, and should only have only QA now
			const firstKnowledgeBase = await environment.privateApiClient.query<
				KnowledgeBaseQuery,
				KnowledgeBaseQueryVariables
			>(KNOWLEDGE_BASE, {
				knowledgeBaseId: knowledBases[0].id,
			});

			expect(firstKnowledgeBase.data.knowledgeBase?.qa).toEqual(<
				KnowledgeBaseQaFragment[]
			>[
				{
					id: createdKnowledBasesQA[0].id,
					answer: createdKnowledBasesQA[0].answer,
					question: createdKnowledBasesQA[0].question,
					date_created: createdKnowledBasesQA[0].date_created,
					date_updated: createdKnowledBasesQA[0].date_updated,
					knowledge_base: expect.anything(),
				},
			]);
		});
	});
});
