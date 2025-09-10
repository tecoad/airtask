import { UnauthorizedException } from '@nestjs/common';
import { user } from '@prisma/client';
import { AccountRole } from 'src/graphql';
import { UserNotAAccountMemberError } from 'src/shared/errors';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import {
	ACCOUNT_KNOWLEDGE_BASES,
	CREATE_KNOWLEDGE_BASE,
	CREATE_KNOWLEDGE_BASE_QA,
	DELETE_KNOWLEDGE_BASE,
	KNOWLEDGE_BASE,
	UPDATE_KNOWLEDGE_BASE,
} from 'test/shared/gql/private/knowledge-base';
import {
	AccountKnowledgeBasesQuery,
	AccountKnowledgeBasesQueryVariables,
	CreateKnowledgeBaseInput,
	CreateKnowledgeBaseMutation,
	CreateKnowledgeBaseMutationVariables,
	CreateKnowledgeBaseQaInput,
	CreateKnowledgeBaseQaMutation,
	CreateKnowledgeBaseQaMutationVariables,
	DeleteKnowledgeBaseMutation,
	DeleteKnowledgeBaseMutationVariables,
	KnowledgeBaseFragment,
	KnowledgeBaseQaFragment,
	KnowledgeBaseQuery,
	KnowledgeBaseQueryVariables,
	KnowledgeBaseType,
	UpdateKnowledgeBaseInput,
	UpdateKnowledgeMutation,
	UpdateKnowledgeMutationVariables,
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
		userWithoutAccounts: user;

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
	});

	afterAll(async () => {
		await environment.close();
	});

	let createdKnowledgeBase: KnowledgeBaseFragment;
	let secondKnowledgeBaseCreatedInSameAccount: KnowledgeBaseFragment;

	let createKnowledgeBaseInput: CreateKnowledgeBaseInput;
	let createKnowledgeBaseQAInput: CreateKnowledgeBaseQaInput[];
	let createdKnowledBasesQA: [KnowledgeBaseQaFragment, KnowledgeBaseQaFragment];

	describe('Create Knowledge Base', () => {
		it('cant create without auth', async () => {
			createKnowledgeBaseInput = {
				title: 'Title',
				type: KnowledgeBaseType.Qa,
			};

			await expect(
				environment.privateApiClient.query<
					CreateKnowledgeBaseMutation,
					CreateKnowledgeBaseMutationVariables
				>(CREATE_KNOWLEDGE_BASE, {
					accountId: accountId,
					input: createKnowledgeBaseInput,
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
					CreateKnowledgeBaseMutation,
					CreateKnowledgeBaseMutationVariables
				>(CREATE_KNOWLEDGE_BASE, {
					accountId: accountId,
					input: createKnowledgeBaseInput,
				}),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('create', async () => {
			environment.privateApiClient.authenticateAsUser(
				userOwnerIntoAccounts.id,
				userOwnerIntoAccounts.email,
			);

			const result = await environment.privateApiClient.query<
				CreateKnowledgeBaseMutation,
				CreateKnowledgeBaseMutationVariables
			>(CREATE_KNOWLEDGE_BASE, {
				accountId: accountId,
				input: createKnowledgeBaseInput,
			});

			expect(result.data.createKnowledgeBase).toEqual(<KnowledgeBaseFragment>{
				id: expect.any(String),
				title: createKnowledgeBaseInput.title,
				type: createKnowledgeBaseInput.type,
				date_updated: null,
				date_created: expect.any(String),
				qa: [],
			});

			createdKnowledgeBase = result.data.createKnowledgeBase;
		});
	});

	// describe('Create Q&A', () => {
	// 	it('cant create without auth', async () => {
	// 		environment.privateApiClient.deleteAuthorizationToken();

	// 		createKnowledgeBaseQAInput = [
	// 			{
	// 				question: 'Question',
	// 				answer: 'Answer',
	// 				knowledge_base_id: [createdKnowledgeBase.id],
	// 			},
	// 		];

	// 		await expect(
	// 			environment.privateApiClient.query<
	// 				CreateKnowledgeBaseQaMutation,
	// 				CreateKnowledgeBaseQaMutationVariables
	// 			>(CREATE_KNOWLEDGE_BASE_QA, {
	// 				input: createKnowledgeBaseQAInput,
	// 			}),
	// 		).rejects.toThrowError(new UnauthorizedException().message);
	// 	});

	// 	it('cant create without been a account member', async () => {
	// 		environment.privateApiClient.authenticateAsUser(
	// 			userWithoutAccounts.id,
	// 			userWithoutAccounts.email,
	// 		);

	// 		await expect(
	// 			environment.privateApiClient.query<
	// 				CreateKnowledgeBaseQaMutation,
	// 				CreateKnowledgeBaseQaMutationVariables
	// 			>(CREATE_KNOWLEDGE_BASE_QA, {
	// 				input: createKnowledgeBaseQAInput,
	// 			}),
	// 		).rejects.toThrowError(new UserNotAAccountMemberError().message);
	// 	});

	// 	it('cant create with knowledge bases from different accounts', async () => {
	// 		environment.privateApiClient.authenticateAsUser(
	// 			userOwnerIntoAccounts.id,
	// 			userOwnerIntoAccounts.email,
	// 		);

	// 		// Create knowledge base in another account
	// 		const knowledgeBaseInAnotherAccount = await environment.privateApiClient.query<
	// 			CreateKnowledgeBaseMutation,
	// 			CreateKnowledgeBaseMutationVariables
	// 		>(CREATE_KNOWLEDGE_BASE, {
	// 			accountId: secondaryAccountId,
	// 			input: createKnowledgeBaseInput,
	// 		});

	// 		createKnowledgeBaseQAInput = [
	// 			{
	// 				question: 'Question',
	// 				answer: 'Answer',
	// 				knowledge_base_id: [
	// 					createdKnowledgeBase.id,
	// 					knowledgeBaseInAnotherAccount.data.createKnowledgeBase.id,
	// 				],
	// 			},
	// 		];

	// 		await expect(
	// 			environment.privateApiClient.query<
	// 				CreateKnowledgeBaseQaMutation,
	// 				CreateKnowledgeBaseQaMutationVariables
	// 			>(CREATE_KNOWLEDGE_BASE_QA, {
	// 				input: createKnowledgeBaseQAInput,
	// 			}),
	// 		).rejects.toThrowError('error.found-knowledge-bases-with-different-accounts');
	// 	});

	// 	it('cant create with knowledge bases from different accounts with diff format of input', async () => {
	// 		environment.privateApiClient.authenticateAsUser(
	// 			userOwnerIntoAccounts.id,
	// 			userOwnerIntoAccounts.email,
	// 		);

	// 		// Create knowledge base in another account
	// 		const knowledgeBaseInAnotherAccount = await environment.privateApiClient.query<
	// 			CreateKnowledgeBaseMutation,
	// 			CreateKnowledgeBaseMutationVariables
	// 		>(CREATE_KNOWLEDGE_BASE, {
	// 			accountId: secondaryAccountId,
	// 			input: createKnowledgeBaseInput,
	// 		});

	// 		createKnowledgeBaseQAInput = [
	// 			{
	// 				question: 'Question',
	// 				answer: 'Answer',
	// 				knowledge_base_id: [createdKnowledgeBase.id],
	// 			},
	// 			{
	// 				question: 'Question',
	// 				answer: 'Answer',
	// 				knowledge_base_id: [knowledgeBaseInAnotherAccount.data.createKnowledgeBase.id],
	// 			},
	// 		];

	// 		await expect(
	// 			environment.privateApiClient.query<
	// 				CreateKnowledgeBaseQaMutation,
	// 				CreateKnowledgeBaseQaMutationVariables
	// 			>(CREATE_KNOWLEDGE_BASE_QA, {
	// 				input: createKnowledgeBaseQAInput,
	// 			}),
	// 		).rejects.toThrowError('error.found-knowledge-bases-with-different-accounts');
	// 	});

	// 	it('create', async () => {
	// 		environment.privateApiClient.authenticateAsUser(
	// 			userOwnerIntoAccounts.id,
	// 			userOwnerIntoAccounts.email,
	// 		);

	// 		// Create knowledge base in another account
	// 		const secondKnowledgeBaseInSameAccount = await environment.privateApiClient.query<
	// 			CreateKnowledgeBaseMutation,
	// 			CreateKnowledgeBaseMutationVariables
	// 		>(CREATE_KNOWLEDGE_BASE, {
	// 			accountId: accountId,
	// 			input: createKnowledgeBaseInput,
	// 		});

	// 		secondKnowledgeBaseCreatedInSameAccount =
	// 			secondKnowledgeBaseInSameAccount.data.createKnowledgeBase;

	// 		// First QA is on both knowledge bases, second QA is only on the first one
	// 		createKnowledgeBaseQAInput = [
	// 			{
	// 				question: 'Question',
	// 				answer: 'Answer',
	// 				knowledge_base_id: [
	// 					createdKnowledgeBase.id,
	// 					secondKnowledgeBaseInSameAccount.data.createKnowledgeBase.id,
	// 				],
	// 			},
	// 			{
	// 				question: 'Question2',
	// 				answer: 'Answer3',
	// 				knowledge_base_id: [createdKnowledgeBase.id],
	// 			},
	// 		];

	// 		const result = await environment.privateApiClient.query<
	// 			CreateKnowledgeBaseQaMutation,
	// 			CreateKnowledgeBaseQaMutationVariables
	// 		>(CREATE_KNOWLEDGE_BASE_QA, {
	// 			input: createKnowledgeBaseQAInput,
	// 		});

	// 		expect(result.data.createKnowledgeBaseQA).toEqual(<KnowledgeBaseQaFragment[]>[
	// 			{
	// 				id: expect.any(String),
	// 				question: createKnowledgeBaseQAInput[0].question,
	// 				answer: createKnowledgeBaseQAInput[0].answer,
	// 				date_updated: null,
	// 				date_created: expect.any(String),
	// 			},
	// 			{
	// 				id: expect.any(String),
	// 				question: createKnowledgeBaseQAInput[1].question,
	// 				answer: createKnowledgeBaseQAInput[1].answer,
	// 				date_updated: null,
	// 				date_created: expect.any(String),
	// 			},
	// 		]);

	// 		createdKnowledBasesQA = [
	// 			result.data.createKnowledgeBaseQA[0],
	// 			result.data.createKnowledgeBaseQA[1],
	// 		];
	// 	});
	// });

	// describe('Update knowledgBaseQA', () => {
	// 	let updateInput: UpdateKnowledgeBaseQaInput;

	// 	it('cant update without auth', async () => {
	// 		environment.privateApiClient.deleteAuthorizationToken();

	// 		updateInput = {
	// 			id: createdKnowledBasesQA[1].id,
	// 			answer: 'Answer2',
	// 			question: 'Question2',
	// 		};

	// 		await expect(
	// 			environment.privateApiClient.query<
	// 				UpdateKnowledgeBaseQaMutation,
	// 				UpdateKnowledgeBaseQaMutationVariables
	// 			>(UPDATE_KNOWLEDGE_BASE_QA, {
	// 				input: updateInput,
	// 			}),
	// 		).rejects.toThrowError(new UnauthorizedException().message);
	// 	});

	// 	it('cant update without been a account member', async () => {
	// 		environment.privateApiClient.authenticateAsUser(
	// 			userWithoutAccounts.id,
	// 			userWithoutAccounts.email,
	// 		);

	// 		await expect(
	// 			environment.privateApiClient.query<
	// 				UpdateKnowledgeBaseQaMutation,
	// 				UpdateKnowledgeBaseQaMutationVariables
	// 			>(UPDATE_KNOWLEDGE_BASE_QA, {
	// 				input: updateInput,
	// 			}),
	// 		).rejects.toThrowError(new UserNotAAccountMemberError().message);
	// 	});

	// 	it('update', async () => {
	// 		environment.privateApiClient.authenticateAsUser(
	// 			userOwnerIntoAccounts.id,
	// 			userOwnerIntoAccounts.email,
	// 		);

	// 		const result = await environment.privateApiClient.query<
	// 			UpdateKnowledgeBaseQaMutation,
	// 			UpdateKnowledgeBaseQaMutationVariables
	// 		>(UPDATE_KNOWLEDGE_BASE_QA, {
	// 			input: updateInput,
	// 		});

	// 		expect(result.data.updateKnowledgeBaseQA).toEqual(<KnowledgeBaseQaFragment>{
	// 			...createdKnowledBasesQA[1],
	// 			...updateInput,
	// 			date_updated: expect.any(String),
	// 		});

	// 		createdKnowledBasesQA[1] = result.data.updateKnowledgeBaseQA;
	// 	});

	// 	it('remove from knowledge base', async () => {
	// 		// First QA is on both knowledge bases, second QA is only on the first one

	// 		// it is present in the first and second knowledge base
	// 		// will be removed from the second one
	// 		const result = await environment.privateApiClient.query<
	// 			UpdateKnowledgeBaseQaMutation,
	// 			UpdateKnowledgeBaseQaMutationVariables
	// 		>(UPDATE_KNOWLEDGE_BASE_QA, {
	// 			input: {
	// 				...updateInput,
	// 				knowledge_base_id: [createdKnowledgeBase.id],
	// 			},
	// 		});

	// 		expect(result.data.updateKnowledgeBaseQA).toEqual({
	// 			...createdKnowledBasesQA[1],
	// 			date_updated: expect.any(String),
	// 		});

	// 		createdKnowledBasesQA[1] = result.data.updateKnowledgeBaseQA;

	// 		const firstKnowledgeBase = await environment.privateApiClient.query<
	// 			KnowledgeBaseQuery,
	// 			KnowledgeBaseQueryVariables
	// 		>(KNOWLEDGE_BASE, {
	// 			knowledgeBaseId: createdKnowledgeBase.id,
	// 		});
	// 		const secondKnowledgeBase = await environment.privateApiClient.query<
	// 			KnowledgeBaseQuery,
	// 			KnowledgeBaseQueryVariables
	// 		>(KNOWLEDGE_BASE, {
	// 			knowledgeBaseId: secondKnowledgeBaseCreatedInSameAccount.id,
	// 		});

	// 		expect(firstKnowledgeBase.data.knowledgeBase?.qa).toEqual([
	// 			createdKnowledBasesQA[0],
	// 			createdKnowledBasesQA[1],
	// 		]);
	// 		expect(secondKnowledgeBase.data.knowledgeBase?.qa).toEqual([]);
	// 	});

	// 	it('add to knowledge base', async () => {
	// 		// now is only present in the first knowledge base.
	// 		// will be added to the second one
	// 		const result = await environment.privateApiClient.query<
	// 			UpdateKnowledgeBaseQaMutation,
	// 			UpdateKnowledgeBaseQaMutationVariables
	// 		>(UPDATE_KNOWLEDGE_BASE_QA, {
	// 			input: {
	// 				...updateInput,
	// 				knowledge_base_id: [
	// 					createdKnowledgeBase.id,
	// 					secondKnowledgeBaseCreatedInSameAccount.id,
	// 				],
	// 			},
	// 		});

	// 		expect(result.data.updateKnowledgeBaseQA).toEqual({
	// 			...createdKnowledBasesQA[1],
	// 			date_updated: expect.any(String),
	// 		});

	// 		createdKnowledBasesQA[1] = result.data.updateKnowledgeBaseQA;

	// 		const firstKnowledgeBase = await environment.privateApiClient.query<
	// 			KnowledgeBaseQuery,
	// 			KnowledgeBaseQueryVariables
	// 		>(KNOWLEDGE_BASE, {
	// 			knowledgeBaseId: createdKnowledgeBase.id,
	// 		});
	// 		const secondKnowledgeBase = await environment.privateApiClient.query<
	// 			KnowledgeBaseQuery,
	// 			KnowledgeBaseQueryVariables
	// 		>(KNOWLEDGE_BASE, {
	// 			knowledgeBaseId: secondKnowledgeBaseCreatedInSameAccount.id,
	// 		});

	// 		expect(firstKnowledgeBase.data.knowledgeBase?.qa).toEqual([
	// 			createdKnowledBasesQA[0],
	// 			createdKnowledBasesQA[1],
	// 		]);
	// 		expect(secondKnowledgeBase.data.knowledgeBase?.qa).toEqual([
	// 			createdKnowledBasesQA[1],
	// 		]);
	// 	});
	// });

	describe('Update knowledgeBase', () => {
		let updateInput: UpdateKnowledgeBaseInput;

		it('cant update without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			updateInput = {
				id: createdKnowledgeBase.id,
				title: 'Title2',
				type: KnowledgeBaseType.Qa,
			};

			await expect(
				environment.privateApiClient.query<
					UpdateKnowledgeMutation,
					UpdateKnowledgeMutationVariables
				>(UPDATE_KNOWLEDGE_BASE, {
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
					UpdateKnowledgeMutation,
					UpdateKnowledgeMutationVariables
				>(UPDATE_KNOWLEDGE_BASE, {
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
				UpdateKnowledgeMutation,
				UpdateKnowledgeMutationVariables
			>(UPDATE_KNOWLEDGE_BASE, {
				input: updateInput,
			});

			expect(result.data.updateKnowledge).toEqual(<KnowledgeBaseFragment>{
				...createdKnowledgeBase,
				...updateInput,
				qa: [],
				date_updated: expect.any(String),
			});

			createdKnowledgeBase = result.data.updateKnowledge;
		});
	});

	describe('Read KnowledgeBase', () => {
		it('cant read without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<
					KnowledgeBaseQuery,
					KnowledgeBaseQueryVariables
				>(KNOWLEDGE_BASE, {
					knowledgeBaseId: createdKnowledgeBase.id,
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant read without been a member of account', async () => {
			environment.privateApiClient.authenticateAsUser(
				userWithoutAccounts.id,
				userWithoutAccounts.email,
			);

			await expect(
				environment.privateApiClient.query<
					KnowledgeBaseQuery,
					KnowledgeBaseQueryVariables
				>(KNOWLEDGE_BASE, {
					knowledgeBaseId: createdKnowledgeBase.id,
				}),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('create 2 q&as for knowleged bases', async () => {
			environment.privateApiClient.authenticateAsUser(
				userOwnerIntoAccounts.id,
				userOwnerIntoAccounts.email,
			);

			// Create knowledge base in another account
			const secondKnowledgeBaseInSameAccount = await environment.privateApiClient.query<
				CreateKnowledgeBaseMutation,
				CreateKnowledgeBaseMutationVariables
			>(CREATE_KNOWLEDGE_BASE, {
				accountId: accountId,
				input: createKnowledgeBaseInput,
			});
			secondKnowledgeBaseCreatedInSameAccount =
				secondKnowledgeBaseInSameAccount.data.createKnowledgeBase;
			// First QA is on both knowledge bases, second QA is only on the first one
			createKnowledgeBaseQAInput = [
				{
					question: 'Question',
					answer: 'Answer',
					knowledge_base_id: [
						createdKnowledgeBase.id,
						secondKnowledgeBaseInSameAccount.data.createKnowledgeBase.id,
					],
				},
				{
					question: 'Question2',
					answer: 'Answer3',
					knowledge_base_id: [createdKnowledgeBase.id],
				},
			];
			const result = await environment.privateApiClient.query<
				CreateKnowledgeBaseQaMutation,
				CreateKnowledgeBaseQaMutationVariables
			>(CREATE_KNOWLEDGE_BASE_QA, {
				input: createKnowledgeBaseQAInput,
			});

			createdKnowledBasesQA = [
				result.data.createKnowledgeBaseQA[0],
				result.data.createKnowledgeBaseQA[1],
			];
		});

		it('read created knowledge bases', async () => {
			environment.privateApiClient.authenticateAsUser(
				userOwnerIntoAccounts.id,
				userOwnerIntoAccounts.email,
			);

			const firstResult = await environment.privateApiClient.query<
				KnowledgeBaseQuery,
				KnowledgeBaseQueryVariables
			>(KNOWLEDGE_BASE, {
				knowledgeBaseId: createdKnowledgeBase.id,
			});
			const secondResult = await environment.privateApiClient.query<
				KnowledgeBaseQuery,
				KnowledgeBaseQueryVariables
			>(KNOWLEDGE_BASE, {
				knowledgeBaseId: secondKnowledgeBaseCreatedInSameAccount.id,
			});

			expect(firstResult.data.knowledgeBase).toEqual(<KnowledgeBaseFragment>{
				...createdKnowledgeBase,
				qa: [createdKnowledBasesQA[0], createdKnowledBasesQA[1]],
			});
			// The second one should only have the first qa
			expect(secondResult.data.knowledgeBase).toEqual(<KnowledgeBaseFragment>{
				...secondKnowledgeBaseCreatedInSameAccount,
				qa: [createdKnowledBasesQA[0]],
			});
		});

		it('cant read all without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<
					AccountKnowledgeBasesQuery,
					AccountKnowledgeBasesQueryVariables
				>(ACCOUNT_KNOWLEDGE_BASES, {
					accountId,
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant read all without been account member', async () => {
			environment.privateApiClient.authenticateAsUser(
				userWithoutAccounts.id,
				userWithoutAccounts.email,
			);

			await expect(
				environment.privateApiClient.query<
					AccountKnowledgeBasesQuery,
					AccountKnowledgeBasesQueryVariables
				>(ACCOUNT_KNOWLEDGE_BASES, {
					accountId,
				}),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('read all knowledge bases from account', async () => {
			environment.privateApiClient.authenticateAsUser(
				userOwnerIntoAccounts.id,
				userOwnerIntoAccounts.email,
			);

			const result = await environment.privateApiClient.query<
				AccountKnowledgeBasesQuery,
				AccountKnowledgeBasesQueryVariables
			>(ACCOUNT_KNOWLEDGE_BASES, {
				accountId,
			});

			expect(result.data.accountKnowledgeBases).toHaveLength(2);
			expect(result.data.accountKnowledgeBases).toEqual(
				expect.arrayContaining([
					{
						...createdKnowledgeBase,
						qa: [createdKnowledBasesQA[0], createdKnowledBasesQA[1]],
					},
					{
						...secondKnowledgeBaseCreatedInSameAccount,
						qa: [createdKnowledBasesQA[0]],
					},
				]),
			);
		});
	});

	// describe('Delete Q&A', () => {
	// 	it('cant delete without auth', async () => {
	// 		environment.privateApiClient.deleteAuthorizationToken();

	// 		await expect(
	// 			environment.privateApiClient.query<
	// 				DeleteKnowledgeBaseQaMutation,
	// 				DeleteKnowledgeBaseQaMutationVariables
	// 			>(DELETE_KNOWLEDGE_BASE_QA, {
	// 				deleteKnowledgeBaseQaId: [createdKnowledBasesQA[1].id],
	// 			}),
	// 		).rejects.toThrowError(new UnauthorizedException().message);
	// 	});

	// 	it('cant delete without been a member of account', async () => {
	// 		environment.privateApiClient.authenticateAsUser(
	// 			userWithoutAccounts.id,
	// 			userWithoutAccounts.email,
	// 		);

	// 		await expect(
	// 			environment.privateApiClient.query<
	// 				DeleteKnowledgeBaseQaMutation,
	// 				DeleteKnowledgeBaseQaMutationVariables
	// 			>(DELETE_KNOWLEDGE_BASE_QA, {
	// 				deleteKnowledgeBaseQaId: [createdKnowledBasesQA[1].id],
	// 			}),
	// 		).rejects.toThrowError(new UserNotAAccountMemberError().message);
	// 	});

	// 	it('delete item', async () => {
	// 		environment.privateApiClient.authenticateAsUser(
	// 			userOwnerIntoAccounts.id,
	// 			userOwnerIntoAccounts.email,
	// 		);

	// 		const result = await environment.privateApiClient.query<
	// 			DeleteKnowledgeBaseQaMutation,
	// 			DeleteKnowledgeBaseQaMutationVariables
	// 		>(DELETE_KNOWLEDGE_BASE_QA, {
	// 			deleteKnowledgeBaseQaId: [createdKnowledBasesQA[1].id],
	// 		});

	// 		expect(result.data.deleteKnowledgeBaseQA).toEqual(true);

	// 		// Find firstKnowledgeBase again, and should only have only QA now
	// 		const firstKnowledgeBase = await environment.privateApiClient.query<
	// 			KnowledgeBaseQuery,
	// 			KnowledgeBaseQueryVariables
	// 		>(KNOWLEDGE_BASE, {
	// 			knowledgeBaseId: createdKnowledgeBase.id,
	// 		});

	// 		expect(firstKnowledgeBase.data.knowledgeBase?.qa).toEqual([
	// 			createdKnowledBasesQA[0],
	// 		]);
	// 	});
	// });

	describe('Delete knowledgeBase', () => {
		it('cant delete without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<
					DeleteKnowledgeBaseMutation,
					DeleteKnowledgeBaseMutationVariables
				>(DELETE_KNOWLEDGE_BASE, {
					deleteKnowledgeBaseId: createdKnowledgeBase.id,
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
					DeleteKnowledgeBaseMutation,
					DeleteKnowledgeBaseMutationVariables
				>(DELETE_KNOWLEDGE_BASE, {
					deleteKnowledgeBaseId: createdKnowledgeBase.id,
				}),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('delete first knowledgebase', async () => {
			environment.privateApiClient.authenticateAsUser(
				userOwnerIntoAccounts.id,
				userOwnerIntoAccounts.email,
			);

			const result = await environment.privateApiClient.query<
				DeleteKnowledgeBaseMutation,
				DeleteKnowledgeBaseMutationVariables
			>(DELETE_KNOWLEDGE_BASE, {
				deleteKnowledgeBaseId: createdKnowledgeBase.id,
			});

			expect(result.data.deleteKnowledgeBase).toBe(true);

			// Cant find the first knowledge base again
			const firstKnowledgeBase = await environment.privateApiClient.query<
				KnowledgeBaseQuery,
				KnowledgeBaseQueryVariables
			>(KNOWLEDGE_BASE, {
				knowledgeBaseId: createdKnowledgeBase.id,
			});
			expect(firstKnowledgeBase.data.knowledgeBase).toBe(null);

			// Because the Q&A in this knowledbase is also in another one, we must still can find it on the another knowledbase
			const secondKnowledgeBase = await environment.privateApiClient.query<
				KnowledgeBaseQuery,
				KnowledgeBaseQueryVariables
			>(KNOWLEDGE_BASE, {
				knowledgeBaseId: secondKnowledgeBaseCreatedInSameAccount.id,
			});
			expect(secondKnowledgeBase.data.knowledgeBase?.qa).toEqual([
				expect.objectContaining({ id: createdKnowledBasesQA[0].id }),
			]);
		});

		it('delete second knowledgebase', async () => {
			const result = await environment.privateApiClient.query<
				DeleteKnowledgeBaseMutation,
				DeleteKnowledgeBaseMutationVariables
			>(DELETE_KNOWLEDGE_BASE, {
				deleteKnowledgeBaseId: secondKnowledgeBaseCreatedInSameAccount.id,
			});
			expect(result.data.deleteKnowledgeBase).toBe(true);

			// Cant find the second knowledge base again
			const secondKnowledgeBase = await environment.privateApiClient.query<
				KnowledgeBaseQuery,
				KnowledgeBaseQueryVariables
			>(KNOWLEDGE_BASE, {
				knowledgeBaseId: secondKnowledgeBaseCreatedInSameAccount.id,
			});
			expect(secondKnowledgeBase.data.knowledgeBase).toBe(null);

			// Now, the Q&A in this knowledbase is not in another one, so we expect it was deleted from the database
			const qaDeleted = await environment.prisma.knowledge_base_qa.findUnique({
				where: {
					id: String(createdKnowledBasesQA[0].id),
				},
			});

			expect(qaDeleted).toBe(null);
		});
	});
});
