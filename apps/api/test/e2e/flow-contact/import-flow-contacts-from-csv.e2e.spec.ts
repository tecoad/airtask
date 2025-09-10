import { ImportFlowContactsResultVariables } from '@airtask/emails';
import { WithLanguageCode } from '@airtask/emails/src/utils/types';
import { UnauthorizedException } from '@nestjs/common';
import { flow_contact, flow_contact_segment } from '@prisma/client';
import * as csv from 'csvtojson';
import { unlinkSync, writeFileSync } from 'fs';
import * as path from 'path';
import { AccountRole, AccountUsageKind } from 'src/graphql';
import { EmailService } from 'src/modules/common/services/email.service';
import {
	EntityNotFoundError,
	UserNotAAccountMemberError,
	UserNotAccountManagerError,
} from 'src/shared/errors';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { IMPORT_FLOW_CONTACTS_FROM_CSV } from 'test/shared/gql/private/flow-contacts';
import {
	FlowContactStatus,
	ImportFlowContactsError,
	ImportFlowContactsErrorCode,
	ImportFlowContactsFromCsvMutation,
	ImportFlowContactsFromCsvMutationVariables,
	ImportFlowContactsQueued,
	LanguageCode,
} from 'test/shared/test-gql-private-api-schema.ts';
import { createUserAsAccountMember } from 'test/shared/utils/create-user-as-account-member';
import { UserWithAccounts } from 'test/shared/utils/create-user-as-account-owner';
import { createUserAsAccountMemberWithSubscription } from 'test/shared/utils/create-user-as-account-with-subscription-member';
import { v4 } from 'uuid';

jest.setTimeout(40000);

describe('Import Flow Contacts From Csv', () => {
	let environment: TestEnvironment,
		userAccountOwner: UserWithAccounts,
		userAccountMember: UserWithAccounts,
		userIntoAnotherAccount: UserWithAccounts,
		flowContactSegment: flow_contact_segment,
		secondFlowContactSegment: flow_contact_segment,
		flowContactSegmentForAnotherAccount: flow_contact_segment,
		accountId: number;

	const makePath = (f: string) => path.join(__dirname, `import-csv-data/${f}.csv`);
	const withInvalidColumnsPath = makePath('with-invalid-columns'),
		withSomeInvalidDataPath = makePath('with-some-invalid-data'),
		withoutItemsPath = makePath('without-items'),
		validPath = makePath('valid'),
		validUpdatePath = makePath('valid-update');

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		userAccountOwner = await createUserAsAccountMemberWithSubscription(environment, {
			accountUserInput: {
				role: AccountRole.owner,
			},
			userInput: {
				language: LanguageCode.Pt,
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
		userIntoAnotherAccount = await createUserAsAccountMemberWithSubscription(environment);

		flowContactSegment = await environment.prisma.flow_contact_segment.create({
			data: {
				id: v4(),
				label: 'Label',
				account: accountId,
			},
		});
		secondFlowContactSegment = await environment.prisma.flow_contact_segment.create({
			data: {
				id: v4(),
				label: 'Label2',
				account: accountId,
			},
		});
		flowContactSegmentForAnotherAccount =
			await environment.prisma.flow_contact_segment.create({
				data: {
					id: v4(),
					label: 'Label',
					account: userIntoAnotherAccount.account_user[0].account_id!,
				},
			});
	});

	afterAll(async () => {
		await environment.close();
	});

	describe('Import errors', () => {
		it('cant import unauthenticated', async () => {
			await expect(
				environment.privateApiClient.uploadFile<
					ImportFlowContactsFromCsvMutation,
					ImportFlowContactsFromCsvMutationVariables
				>(IMPORT_FLOW_CONTACTS_FROM_CSV, withInvalidColumnsPath, 'csv', {
					input: {
						account: accountId,
						segment: flowContactSegment.id,
					},
					csv: null,
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant import as member of another account', async () => {
			environment.privateApiClient.authenticateAsUser(
				userIntoAnotherAccount.id,
				userIntoAnotherAccount.email,
			);

			await expect(
				environment.privateApiClient.uploadFile<
					ImportFlowContactsFromCsvMutation,
					ImportFlowContactsFromCsvMutationVariables
				>(IMPORT_FLOW_CONTACTS_FROM_CSV, withInvalidColumnsPath, 'csv', {
					input: {
						account: accountId,
						segment: flowContactSegment.id,
					},
					csv: null,
				}),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('cant import without account manager permission', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);

			await expect(
				environment.privateApiClient.uploadFile<
					ImportFlowContactsFromCsvMutation,
					ImportFlowContactsFromCsvMutationVariables
				>(IMPORT_FLOW_CONTACTS_FROM_CSV, withInvalidColumnsPath, 'csv', {
					input: {
						account: accountId,
						segment: flowContactSegment.id,
					},
					csv: null,
				}),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('cant import with a segment for another account', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			await expect(
				environment.privateApiClient.uploadFile<
					ImportFlowContactsFromCsvMutation,
					ImportFlowContactsFromCsvMutationVariables
				>(IMPORT_FLOW_CONTACTS_FROM_CSV, withInvalidColumnsPath, 'csv', {
					input: {
						account: accountId,
						segment: flowContactSegmentForAnotherAccount.id,
					},
					csv: null,
				}),
			).rejects.toThrowError(
				new EntityNotFoundError(
					'flow_contact_segment',
					flowContactSegmentForAnotherAccount.id,
				).message,
			);
		});

		it('cant import with invalid columns', async () => {
			const { data } = await environment.privateApiClient.uploadFile<
				ImportFlowContactsFromCsvMutation,
				ImportFlowContactsFromCsvMutationVariables
			>(IMPORT_FLOW_CONTACTS_FROM_CSV, withInvalidColumnsPath, 'csv', {
				input: {
					account: accountId,
					segment: flowContactSegment.id,
				},
				csv: null,
			});

			expect(data.importFlowContactsFromCsv).toEqual(<ImportFlowContactsError>{
				errorCode: ImportFlowContactsErrorCode.InvalidCsvColumnsStructure,
				message: expect.stringMatching(/^(phone,last_name|last_name,phone)$/),
			});
		});

		it('cant import without any items', async () => {
			const { data } = await environment.privateApiClient.uploadFile<
				ImportFlowContactsFromCsvMutation,
				ImportFlowContactsFromCsvMutationVariables
			>(IMPORT_FLOW_CONTACTS_FROM_CSV, withoutItemsPath, 'csv', {
				input: {
					account: accountId,
					segment: flowContactSegment.id,
				},
				csv: null,
			});

			expect(data.importFlowContactsFromCsv).toEqual(<ImportFlowContactsError>{
				errorCode: ImportFlowContactsErrorCode.NoItemsFound,
				message: expect.any(String),
			});
		});
	});

	// The suits on this group depends on each other
	describe('Import data', () => {
		const getWaitImportFinishReportCall = () => {
			return new Promise<
				Parameters<(typeof EmailService)['prototype']['importFlowContactsResult']>
			>((resolve) => {
				jest
					.spyOn(EmailService.prototype, 'importFlowContactsResult')
					.mockImplementation(async (...params) => {
						resolve(params);
					});
			});
		};

		it('import flow contacts from correct csv', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			const waitFinishCall = getWaitImportFinishReportCall();

			const { data } = await environment.privateApiClient.uploadFile<
				ImportFlowContactsFromCsvMutation,
				ImportFlowContactsFromCsvMutationVariables
			>(IMPORT_FLOW_CONTACTS_FROM_CSV, validPath, 'csv', {
				input: {
					account: accountId,
					segment: flowContactSegment.id,
				},
				csv: null,
			});

			expect(data.importFlowContactsFromCsv).toEqual(<ImportFlowContactsQueued>{
				import_id: expect.any(String),
				queued_items: 3,
			});

			const [to, props, settings] = await waitFinishCall;

			expect(to).toEqual(userAccountOwner.email);
			expect(props).toEqual(<WithLanguageCode<ImportFlowContactsResultVariables>>{
				failedItems: 0,
				successItems: 3,
				totalItems: 3,
				languageCode: userAccountOwner.language,
			});
			expect(settings?.attachments).toBeUndefined();

			const createdItems = await environment.prisma.flow_contact.findMany({
				where: {
					account: accountId,
				},
				include: {
					flow_contact_flow_contact_segment: true,
				},
				orderBy: {
					date_created: 'asc',
				},
			});

			const sharedCreatedAssert = <Partial<(typeof createdItems)[number]>>{
				status: FlowContactStatus.Active,
				account: accountId,
				flow_contact_flow_contact_segment: [
					{
						id: expect.any(Number),
						flow_contact_id: expect.any(String),
						flow_contact_segment_id: flowContactSegment.id,
					},
				],
			};

			expect(createdItems).toHaveLength(3);
			expect(createdItems).toEqual([
				expect.objectContaining({
					...sharedCreatedAssert,
					phone: '+5531999999999',
					email: 'johndoe1@example.com',
					first_name: 'John1',
					last_name: 'Doe1',
				}),
				expect.objectContaining({
					...sharedCreatedAssert,
					phone: '+5531999999998',
					email: 'johndoe2@example.com',
					first_name: 'John2',
					last_name: 'Doe2',
				}),
				expect.objectContaining({
					...sharedCreatedAssert,
					phone: '+5531999999997',
					email: 'johndoe3@example.com',
					first_name: 'John3',
					last_name: 'Doe3',
				}),
			]);
		});

		let createdItem: flow_contact;

		it('import flow contacts with invalid rows at csv', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			// First delete all created flow contacts for the account
			await environment.prisma.flow_contact.deleteMany({
				where: {
					account: accountId,
				},
			});

			const waitFinishCall = getWaitImportFinishReportCall();

			const { data } = await environment.privateApiClient.uploadFile<
				ImportFlowContactsFromCsvMutation,
				ImportFlowContactsFromCsvMutationVariables
			>(IMPORT_FLOW_CONTACTS_FROM_CSV, withSomeInvalidDataPath, 'csv', {
				input: {
					account: accountId,
					segment: flowContactSegment.id,
				},
				csv: null,
			});

			expect(data.importFlowContactsFromCsv).toEqual(<ImportFlowContactsQueued>{
				import_id: expect.any(String),
				queued_items: 3,
			});

			const [to, props, settings] = await waitFinishCall;

			expect(to).toEqual(userAccountOwner.email);
			expect(props).toEqual(<WithLanguageCode<ImportFlowContactsResultVariables>>{
				failedItems: 2,
				successItems: 1,
				totalItems: 3,
				languageCode: userAccountOwner.language,
			});
			expect(settings).toBeDefined();

			// Decode send attachment from base64 to csv array
			const errorFileBase64 = settings!.attachments![0].content;
			const tempOutput = path.join(process.cwd(), 'temp', `${v4()}.csv`);
			writeFileSync(tempOutput, errorFileBase64, 'base64');
			const erroredData = (await csv().fromFile(tempOutput)) as {
				line: string;
				error: string;
			}[];
			unlinkSync(tempOutput);

			erroredData.sort((a, b) => Number(a.line) - Number(b.line));
			expect(erroredData).toEqual([
				{
					line: '3',
					error: 'email - first_name',
				},
				{
					line: '4',
					error: 'phone - last_name',
				},
			]);

			const createdItems = await environment.prisma.flow_contact.findMany({
				where: {
					account: accountId,
				},
				include: {
					flow_contact_flow_contact_segment: true,
				},
				orderBy: {
					date_created: 'asc',
				},
			});

			const sharedCreatedAssert = <Partial<(typeof createdItems)[number]>>{
				status: FlowContactStatus.Active,
				account: accountId,
				flow_contact_flow_contact_segment: [
					{
						id: expect.any(Number),
						flow_contact_id: expect.any(String),
						flow_contact_segment_id: flowContactSegment.id,
					},
				],
			};
			expect(createdItems).toHaveLength(1);
			expect(createdItems).toEqual([
				expect.objectContaining({
					...sharedCreatedAssert,
					phone: '+5531999999999',
					email: 'johndoe1@example.com',
					first_name: 'John1',
					last_name: 'Doe1',
				}),
			]);

			createdItem = createdItems[0];
		});

		it('import flow contacts with existent phone to update', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			const waitFinishCall = getWaitImportFinishReportCall();

			const { data } = await environment.privateApiClient.uploadFile<
				ImportFlowContactsFromCsvMutation,
				ImportFlowContactsFromCsvMutationVariables
			>(IMPORT_FLOW_CONTACTS_FROM_CSV, validUpdatePath, 'csv', {
				input: {
					account: accountId,
					segment: flowContactSegment.id,
				},
				csv: null,
			});

			expect(data.importFlowContactsFromCsv).toEqual(<ImportFlowContactsQueued>{
				import_id: expect.any(String),
				queued_items: 1,
			});

			const [to, props, settings] = await waitFinishCall;

			expect(to).toEqual(userAccountOwner.email);
			expect(props).toEqual(<WithLanguageCode<ImportFlowContactsResultVariables>>{
				failedItems: 0,
				successItems: 1,
				totalItems: 1,
				languageCode: userAccountOwner.language,
			});
			expect(settings?.attachments).toBeUndefined();

			const createdItems = await environment.prisma.flow_contact.findMany({
				where: {
					account: accountId,
				},
				include: {
					flow_contact_flow_contact_segment: true,
				},
				orderBy: {
					date_created: 'asc',
				},
			});

			const sharedCreatedAssert = <Partial<(typeof createdItems)[number]>>{
				status: FlowContactStatus.Active,
				account: accountId,
				flow_contact_flow_contact_segment: [
					{
						id: expect.any(Number),
						flow_contact_id: expect.any(String),
						flow_contact_segment_id: flowContactSegment.id,
					},
				],
			};
			// Hasn't crated any new items
			expect(createdItems).toHaveLength(1);
			expect(createdItems).toEqual([
				expect.objectContaining({
					...sharedCreatedAssert,
					id: createdItem.id,
					phone: '+5531999999999',
					email: 'johndoe12@example.com',
					first_name: 'John12',
					last_name: 'Doe12',
				}),
			]);
		});

		it('import flow contacts with existent phone to update with diff segment', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			const waitFinishCall = getWaitImportFinishReportCall();

			const { data } = await environment.privateApiClient.uploadFile<
				ImportFlowContactsFromCsvMutation,
				ImportFlowContactsFromCsvMutationVariables
			>(IMPORT_FLOW_CONTACTS_FROM_CSV, validUpdatePath, 'csv', {
				input: {
					account: accountId,
					segment: secondFlowContactSegment.id,
				},
				csv: null,
			});

			expect(data.importFlowContactsFromCsv).toEqual(<ImportFlowContactsQueued>{
				import_id: expect.any(String),
				queued_items: 1,
			});

			const [to, props, settings] = await waitFinishCall;

			expect(to).toEqual(userAccountOwner.email);
			expect(props).toEqual(<WithLanguageCode<ImportFlowContactsResultVariables>>{
				failedItems: 0,
				successItems: 1,
				totalItems: 1,
				languageCode: userAccountOwner.language,
			});
			expect(settings?.attachments).toBeUndefined();

			const createdItems = await environment.prisma.flow_contact.findMany({
				where: {
					account: accountId,
				},
				include: {
					flow_contact_flow_contact_segment: true,
				},
				orderBy: {
					date_created: 'asc',
				},
			});

			const sharedCreatedAssert = <Partial<(typeof createdItems)[number]>>{
				status: FlowContactStatus.Active,
				account: accountId,
				flow_contact_flow_contact_segment: [
					{
						id: expect.any(Number),
						flow_contact_id: expect.any(String),
						flow_contact_segment_id: flowContactSegment.id,
					},
					{
						id: expect.any(Number),
						flow_contact_id: expect.any(String),
						flow_contact_segment_id: secondFlowContactSegment.id,
					},
				],
			};
			// Hasn't crated any new items
			expect(createdItems).toHaveLength(1);
			expect(createdItems).toEqual([
				expect.objectContaining({
					...sharedCreatedAssert,
					id: createdItem.id,
					phone: '+5531999999999',
					email: 'johndoe12@example.com',
					first_name: 'John12',
					last_name: 'Doe12',
				}),
			]);
		});
	});
});
