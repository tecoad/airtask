import { UnauthorizedException } from '@nestjs/common';
import { quotation, user } from '@prisma/client';
import { AccountUsageKind, CreateQuotationQuestionInput } from 'src/graphql';
import {
	UserNotAAccountMemberError,
	UserNotAccountManagerError,
} from 'src/shared/errors';

import { AccountRole, QuotationStatus } from 'src/shared/types/db';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { mockWidgetConfigInput } from 'test/mocks/entities/widget-config';
import {
	ACCOUNT_QUOTATION,
	ACCOUNT_QUOTATIONS,
	CREATE_QUOTATION,
	CREATE_QUOTATION_QUESTION,
	DELETE_QUOTATION,
	DELETE_QUOTATION_QUESTION,
	UPDATE_QUOTATION,
	UPDATE_QUOTATION_QUESTION,
} from 'test/shared/gql/private/quotation';
import {
	AccountQuotationQuery,
	AccountQuotationQueryVariables,
	AccountQuotationsQuery,
	AccountQuotationsQueryVariables,
	CreateQuotationInput,
	CreateQuotationMutation,
	CreateQuotationMutationVariables,
	CreateQuotationQuestionMutation,
	CreateQuotationQuestionMutationVariables,
	DeleteQuotationMutation,
	DeleteQuotationMutationVariables,
	DeleteQuotationQuestionMutation,
	DeleteQuotationQuestionMutationVariables,
	QuotationFragment,
	QuotationQuestionFragment,
	QuotationWithCountsFragment,
	SoftDeleteQueryMode,
	UpdateQuotationMutation,
	UpdateQuotationMutationVariables,
	UpdateQuotationQuestionMutation,
	UpdateQuotationQuestionMutationVariables,
} from 'test/shared/test-gql-private-api-schema.ts';
import { createUserAsAccountMember } from 'test/shared/utils/create-user-as-account-member';
import { UserWithAccounts } from 'test/shared/utils/create-user-as-account-owner';
import { createUserAsAccountMemberWithSubscription } from 'test/shared/utils/create-user-as-account-with-subscription-member';
import { createUserWithoutAccount } from 'test/shared/utils/create-user-without-account';
import { v4 } from 'uuid';

jest.setTimeout(15000);

// // This will check permissions for the user
// // and is not exactly what we want to test here
// // because it will be testes on unit tests
// jest
// 	.spyOn(AccountPermissionsManagerService.prototype, 'isUserAllowedToReadModuleInAccount')
// 	.mockResolvedValue(true);
// jest
// 	.spyOn(
// 		AccountPermissionsManagerService.prototype,
// 		'isUserAllowedToManageModuleInAccount',
// 	)
// 	.mockResolvedValue(true);

describe('Manage Quotation', () => {
	let userAccountOwner: UserWithAccounts,
		userAccountMember: UserWithAccounts,
		userWithoutAccount: user,
		accountId: number,
		quotation: quotation,
		environment: TestEnvironment;

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		userAccountOwner = await createUserAsAccountMemberWithSubscription(environment, {
			accountUserInput: {
				role: AccountRole.Owner,
			},
			subscriptionInput: {},
			subscriptionPlanInput: {
				name: 'Plan',
				allowed_modules: [AccountUsageKind.quotation],
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
		userWithoutAccount = await createUserWithoutAccount(environment);
	});

	afterAll(async () => {
		await environment.close();
	});

	let createInput: CreateQuotationInput;

	describe('Create', () => {
		it('cant create without auth', async () => {
			createInput = {
				title: 'Quotation 1',
				account: accountId,
				prompt_instructions: 'Instructions',
				status: QuotationStatus.Published,
			};

			await expect(
				environment.privateApiClient.query<
					CreateQuotationMutation,
					CreateQuotationMutationVariables
				>(CREATE_QUOTATION, {
					input: createInput,
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant create without been a account member', async () => {
			environment.privateApiClient.authenticateAsUser(
				userWithoutAccount.id,
				userWithoutAccount.email,
			);

			await expect(
				environment.privateApiClient.query<
					CreateQuotationMutation,
					CreateQuotationMutationVariables
				>(CREATE_QUOTATION, {
					input: createInput,
				}),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('cant create without been a account owner', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);

			await expect(
				environment.privateApiClient.query<
					CreateQuotationMutation,
					CreateQuotationMutationVariables
				>(CREATE_QUOTATION, {
					input: createInput,
				}),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('creates a quotation', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			const res = await environment.privateApiClient.query<
				CreateQuotationMutation,
				CreateQuotationMutationVariables
			>(CREATE_QUOTATION, {
				input: createInput,
			});

			expect(res.data.createQuotation).toMatchObject(<
				CreateQuotationMutation['createQuotation']
			>{
				id: expect.any(String),
				title: 'Quotation 1',
				prompt_instructions: 'Instructions',
				widget_config: null,
			});

			quotation = await environment.prisma.quotation.findUniqueOrThrow({
				where: { id: String(res.data.createQuotation.id) },
			});
			expect(quotation).toMatchObject({
				id: expect.any(String),
				title: 'Quotation 1',
				prompt_instructions: 'Instructions',
				widget_config: null,
			});
		});
	});

	let questionsResult: QuotationQuestionFragment[] = [];
	let questions: CreateQuotationQuestionInput[];

	describe('Craete Questions', () => {
		it('cant create without been a account manager', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);

			questions = [
				{
					label: 'What is the age of your house?',
					quotation: String(quotation.id),
					order: 1,
					active: true,
					children: [
						{
							label: 'How many years of warranty do you want?',
							condition: 'when the house has more than 10 years',
							order: 1,
							children: [
								{
									label: 'What is the size of your house?',
									condition: 'when the warranty is more than 5 years',
									order: 1,
								},
								{
									label: 'Is your house built on foundations?',
									condition: 'when the warranty is more than 10 years',
									order: 2,
								},
							],
						},
					],
				},
				{
					label: 'What is the current color of your house?',
					quotation: String(quotation.id),
					order: 2,
					active: true,
				},
			];

			await expect(
				environment.privateApiClient.query<
					CreateQuotationQuestionMutation,
					CreateQuotationQuestionMutationVariables
				>(CREATE_QUOTATION_QUESTION, {
					input: questions,
				}),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('creates quotation questions', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			const res = await environment.privateApiClient.query<
				CreateQuotationQuestionMutation,
				CreateQuotationQuestionMutationVariables
			>(CREATE_QUOTATION_QUESTION, {
				input: questions,
			});

			const result = res.data.createQuotationQuestion;

			const question1Top = result.find((item) => item.label === questions[0].label)!;
			const question1FirstChild = result.find(
				(item) => item.label === questions[0].children?.[0].label,
			)!;

			expect(result).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						id: expect.any(String),
						parent: null,
						label: questions[0].label,
						order: 1,
						quotation: String(quotation.id),
					}),
					expect.objectContaining({
						id: expect.any(String),
						label: questions[0].children?.[0].label,
						parent: question1Top.id,
						order: 1,
						quotation: String(quotation.id),
					}),
					expect.objectContaining({
						id: expect.any(String),
						label: questions[0].children?.[0].children![0].label,
						parent: question1FirstChild.id,
						order: 1,
						quotation: String(quotation.id),
					}),
					expect.objectContaining({
						id: expect.any(String),
						label: questions[0].children![0].children![1].label,
						parent: question1FirstChild.id,
						order: 2,
						quotation: String(quotation.id),
					}),
					expect.objectContaining({
						id: expect.any(String),
						label: questions[1].label,
						parent: null,
						order: 2,
						quotation: String(quotation.id),
					}),
				]),
			);

			// Using expect.arrayContaining to check if the result
			// so we need to check the length of the result
			expect(result).toHaveLength(5);

			// We just assign the result to assert on next tests
			// because after the expectations above, the result
			// is correct
			questionsResult = result;
		});
	});

	describe('Update', () => {
		it('cant update without been a account manager', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);

			await expect(
				environment.privateApiClient.query<
					UpdateQuotationMutation,
					UpdateQuotationMutationVariables
				>(UPDATE_QUOTATION, {
					input: {
						id: quotation.id,
						title: 'Quotation 1 Updated',
						status: QuotationStatus.Archived,
						prompt_instructions: 'Instructions23',
					},
				}),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('updates a quotation', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			const res = await environment.privateApiClient.query<
				UpdateQuotationMutation,
				UpdateQuotationMutationVariables
			>(UPDATE_QUOTATION, {
				input: {
					id: quotation.id,
					title: 'Quotation 1 Updated',
					status: QuotationStatus.Archived,
					prompt_instructions: 'Instructions23',
				},
			});

			expect(res.data.updateQuotation).toMatchObject(<
				UpdateQuotationMutation['updateQuotation']
			>{
				id: quotation.id.toString(),
				title: 'Quotation 1 Updated',
				status: QuotationStatus.Archived,
				questions: expect.arrayContaining(questionsResult),
				prompt_instructions: 'Instructions23',
				widget_config: null,
			});
			// Assert questions length (arrayContaining)
			expect(res.data.updateQuotation.questions).toHaveLength(5);

			quotation = await environment.prisma.quotation.findUniqueOrThrow({
				where: { id: quotation.id },
			});
			expect(quotation).toMatchObject({
				id: quotation.id,
				title: 'Quotation 1 Updated',
				status: QuotationStatus.Archived,
				prompt_instructions: 'Instructions23',
				widget_config: null,
			});
		});

		it('create widget settings on update if not exists', async () => {
			// last suit we assert widget_config is null.
			const widget_config = mockWidgetConfigInput();

			const res = await environment.privateApiClient.query<
				UpdateQuotationMutation,
				UpdateQuotationMutationVariables
			>(UPDATE_QUOTATION, {
				input: {
					id: quotation.id,
					widget_config,
				},
			});

			expect(res.data.updateQuotation).toMatchObject(<
				UpdateQuotationMutation['updateQuotation']
			>{
				id: quotation.id.toString(),
				widget_config,
			});

			quotation = await environment.prisma.quotation.findUniqueOrThrow({
				where: { id: quotation.id },
			});

			expect(quotation.widget_config).toEqual(expect.any(Number));
		});

		it('updates widget settings on update if exists', async () => {
			const widget_config = mockWidgetConfigInput();

			const res = await environment.privateApiClient.query<
				UpdateQuotationMutation,
				UpdateQuotationMutationVariables
			>(UPDATE_QUOTATION, {
				input: {
					id: quotation.id,
					widget_config,
				},
			});

			expect(res.data.updateQuotation).toMatchObject(<
				UpdateQuotationMutation['updateQuotation']
			>{
				id: quotation.id.toString(),
				widget_config,
			});

			const previousWidgetSettingsId = quotation.widget_config;

			quotation = await environment.prisma.quotation.findUniqueOrThrow({
				where: { id: quotation.id },
			});

			// Assert widget_config id is the same
			expect(quotation.widget_config).toEqual(previousWidgetSettingsId);
		});

		it('delete widget settings on update if null', async () => {
			const res = await environment.privateApiClient.query<
				UpdateQuotationMutation,
				UpdateQuotationMutationVariables
			>(UPDATE_QUOTATION, {
				input: {
					id: quotation.id,
					widget_config: null,
				},
			});

			expect(res.data.updateQuotation).toMatchObject(<
				UpdateQuotationMutation['updateQuotation']
			>{
				id: quotation.id.toString(),
				widget_config: null,
			});

			const previousWidgetSettingsId = quotation.widget_config;

			quotation = await environment.prisma.quotation.findUniqueOrThrow({
				where: { id: quotation.id },
			});

			expect(quotation.widget_config).toBeNull();

			// Expect widget settings to be deleted
			const widgetSettings = await environment.prisma.widget_config.findUnique({
				where: { id: previousWidgetSettingsId! },
			});

			expect(widgetSettings).toBeNull();
		});

		it('updates a quotation question', async () => {
			const secondTopLevelCreated = questionsResult.find(
				(item) => item.label === questions[1].label,
			)!;
			const toUpdate = questionsResult.find(
				(item) => item.label === questions[0].children![0].label,
			)!;

			const result = await environment.privateApiClient.query<
				UpdateQuotationQuestionMutation,
				UpdateQuotationQuestionMutationVariables
			>(UPDATE_QUOTATION_QUESTION, {
				input: {
					id: toUpdate.id,
					condition: 'new condition',
					label: 'new label',
					order: 5,
					parent: secondTopLevelCreated.id,
				},
			});

			expect(result.data.updateQuotationQuestion).toMatchObject(<
				QuotationQuestionFragment
			>{
				id: toUpdate.id,
				label: 'new label',
				parent: secondTopLevelCreated.id,
				order: 5,
				quotation: String(quotation.id),
			});

			// Here we changed condition, label, order, and moved as child of second top level question
			// so we change this object to expect correctly on next tests
			// Remove old data
			questionsResult = questionsResult.filter((item) => item.id !== toUpdate.id);

			// Add new data
			questionsResult.push({
				...toUpdate,
				condition: 'new condition',
				label: 'new label',
				order: 5,
				parent: secondTopLevelCreated.id as string,
			});
			// Remove undefined
			questionsResult = questionsResult.filter(Boolean);
		});
	});

	describe('Find and delete', () => {
		it('cant find account quotations without been account member', async () => {
			environment.privateApiClient.authenticateAsUser(
				userWithoutAccount.id,
				userWithoutAccount.email,
			);

			await expect(
				environment.privateApiClient.query<
					AccountQuotationsQuery,
					AccountQuotationsQueryVariables
				>(ACCOUNT_QUOTATIONS, {
					account: accountId,
					mode: SoftDeleteQueryMode.ShowOnlyNotDeleted,
				}),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('finds quotation into account quotations list', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);

			const res = await environment.privateApiClient.query<
				AccountQuotationsQuery,
				AccountQuotationsQueryVariables
			>(ACCOUNT_QUOTATIONS, {
				account: accountId,
				mode: SoftDeleteQueryMode.ShowOnlyNotDeleted,
			});

			expect(res.data.accountQuotations).toEqual([
				expect.objectContaining(<QuotationFragment>{
					id: quotation.id.toString(),
					title: 'Quotation 1 Updated',
					questions: expect.arrayContaining(questionsResult),
				}),
			]);
			// Assert questions length (arrayContaining)
			expect(res.data.accountQuotations[0].questions).toHaveLength(5);
		});

		it('cant delete a quotation question without been account manager', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);

			const toDelete = questionsResult.find((item) => item.label === questions[0].label)!;

			await expect(
				environment.privateApiClient.query<
					DeleteQuotationQuestionMutation,
					DeleteQuotationQuestionMutationVariables
				>(DELETE_QUOTATION_QUESTION, { deleteQuotationQuestionId: toDelete.id }),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('deletes a quotation question', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			const toDelete = questionsResult.find((item) => item.label === questions[0].label)!;

			const res = await environment.privateApiClient.query<
				DeleteQuotationQuestionMutation,
				DeleteQuotationQuestionMutationVariables
			>(DELETE_QUOTATION_QUESTION, { deleteQuotationQuestionId: toDelete.id });

			expect(res.data.deleteQuotationQuestion).toBe(true);

			const item = await environment.prisma.quotation_question.findUnique({
				where: { id: String(toDelete.id) },
			});
			expect(item).toBeFalsy();

			// Remove deleted item from questionsResult
			questionsResult = questionsResult.filter((item) => item.id !== toDelete.id);
		});

		it('finds quotation by id', async () => {
			// Here we create 2 quotation_request to test the requests_count field
			await environment.prisma.quotation_request.create({
				data: {
					id: v4(),
					sequential_id: 1,
					request_data: [],
					quotation_conversation_quotation_request_quotation_conversationToquotation_conversation:
						{
							create: {
								quotation: quotation.id,
							},
						},
				},
			});
			await environment.prisma.quotation_request.create({
				data: {
					id: v4(),
					sequential_id: 2,
					request_data: [],
					quotation_conversation_quotation_request_quotation_conversationToquotation_conversation:
						{
							create: {
								quotation: quotation.id,
							},
						},
				},
			});

			const res = await environment.privateApiClient.query<
				AccountQuotationQuery,
				AccountQuotationQueryVariables
			>(ACCOUNT_QUOTATION, { accountQuotationId: quotation.id });

			expect(res.data.accountQuotation).toEqual(
				expect.objectContaining(<QuotationWithCountsFragment>{
					id: quotation.id.toString(),
					title: 'Quotation 1 Updated',
					questions: expect.arrayContaining(questionsResult),
					questions_count: 4,
					requests_count: 2,
				}),
			);
			// Assert questions length (arrayContaining)
			expect(res.data.accountQuotation!.questions).toHaveLength(4);
		});

		it('cant delete quotation without been account member', async () => {
			environment.privateApiClient.authenticateAsUser(
				userWithoutAccount.id,
				userWithoutAccount.email,
			);

			await expect(
				environment.privateApiClient.query<
					DeleteQuotationMutation,
					DeleteQuotationMutationVariables
				>(DELETE_QUOTATION, { deleteQuotationId: quotation.id }),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('cant delete quotation without been account manager', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);

			await expect(
				environment.privateApiClient.query<
					DeleteQuotationMutation,
					DeleteQuotationMutationVariables
				>(DELETE_QUOTATION, { deleteQuotationId: quotation.id }),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('deletes quotation by id', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);
			const res = await environment.privateApiClient.query<
				DeleteQuotationMutation,
				DeleteQuotationMutationVariables
			>(DELETE_QUOTATION, { deleteQuotationId: quotation.id });

			expect(res.data.deleteQuotation).toBe(true);
		});

		it('cant find delete quotation in not deleted list', async () => {
			const res = await environment.privateApiClient.query<
				AccountQuotationsQuery,
				AccountQuotationsQueryVariables
			>(ACCOUNT_QUOTATIONS, {
				account: accountId,
				mode: SoftDeleteQueryMode.ShowOnlyNotDeleted,
			});

			expect(res.data.accountQuotations).toEqual([]);
		});

		it('can find deleted quotation in deleted list', async () => {
			const res = await environment.privateApiClient.query<
				AccountQuotationsQuery,
				AccountQuotationsQueryVariables
			>(ACCOUNT_QUOTATIONS, {
				account: accountId,
				mode: SoftDeleteQueryMode.ShowOnlyDeleted,
			});

			expect(res.data.accountQuotations).toEqual([
				expect.objectContaining({
					id: quotation.id.toString(),
				}),
			]);
		});
	});
});
