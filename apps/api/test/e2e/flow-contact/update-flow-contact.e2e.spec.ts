import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { Prisma, flow_contact, flow_contact_segment } from '@prisma/client';
import { ValidationError } from 'apollo-server-express';
import { AccountRole, AccountUsageKind } from 'src/graphql';
import {
	UserNotAAccountMemberError,
	UserNotAccountManagerError,
} from 'src/shared/errors';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import {
	BATCH_UPDATE_FLOW_CONTACT,
	TOGGLE_FLOW_CONTACT_IN_SEGMENT,
} from 'test/shared/gql/private/flow-contacts';
import {
	BatchUpdateFlowContactMutation,
	BatchUpdateFlowContactMutationVariables,
	FlowContactFragment,
	FlowContactStatus,
	ToggleFlowContactInSegmentMode,
	ToggleFlowContactInSegmentMutation,
	ToggleFlowContactInSegmentMutationVariables,
} from 'test/shared/test-gql-private-api-schema.ts';
import { createUserAsAccountMember } from 'test/shared/utils/create-user-as-account-member';
import { UserWithAccounts } from 'test/shared/utils/create-user-as-account-owner';
import { createUserAsAccountMemberWithSubscription } from 'test/shared/utils/create-user-as-account-with-subscription-member';
import { v4 } from 'uuid';

type ContactWithSegment = flow_contact & {
	flow_contact_flow_contact_segment: {
		flow_contact_segment: flow_contact_segment | null;
	}[];
};

describe('Update Flow Contact', () => {
	let environment: TestEnvironment,
		userAccountManager: UserWithAccounts,
		userAccountMember: UserWithAccounts,
		userIntoAnotherAccount: UserWithAccounts,
		accountId: number,
		flowContact01: ContactWithSegment,
		flowContact02: ContactWithSegment,
		flowContactIntoAnotherAccount: ContactWithSegment,
		segment: flow_contact_segment,
		segment02: flow_contact_segment,
		segmentIntoAnotherAccount: flow_contact_segment;

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		userAccountManager = await createUserAsAccountMemberWithSubscription(environment, {
			accountUserInput: {
				role: AccountRole.owner,
			},
			subscriptionInput: {},
			subscriptionPlanInput: {
				name: 'Plan',
				allowed_modules: [AccountUsageKind.flow],
			},
		});

		accountId = userAccountManager.account_user[0].account_id!;

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

		const contact = (
				customAccountId?: number,
			): Prisma.flow_contactCreateArgs['data'] => ({
				id: v4(),
				account: customAccountId || accountId,
				status: FlowContactStatus.Inactive,
				email: faker.internet.email(),
				phone: faker.phone.number('+55319########'),
				first_name: faker.name.firstName(),
				last_name: faker.name.lastName(),
			}),
			include = {
				flow_contact_flow_contact_segment: {
					include: {
						flow_contact_segment: true,
					},
				},
			} satisfies Prisma.flow_contactCreateArgs['include'];

		flowContact01 = await environment.prisma.flow_contact.create({
			data: contact(),
			include,
		});
		flowContact02 = await environment.prisma.flow_contact.create({
			data: contact(),
			include,
		});
		const anotherAccountId = userIntoAnotherAccount.account_user[0].account_id!;
		flowContactIntoAnotherAccount = await environment.prisma.flow_contact.create({
			data: contact(anotherAccountId),
			include,
		});

		segment = await environment.prisma.flow_contact_segment.create({
			data: {
				id: v4(),
				label: 'Test',
				account: accountId,
			},
		});
		segment02 = await environment.prisma.flow_contact_segment.create({
			data: {
				id: v4(),
				label: 'Test',
				account: accountId,
			},
		});
		segmentIntoAnotherAccount = await environment.prisma.flow_contact_segment.create({
			data: {
				id: v4(),
				label: 'Test',
				account: anotherAccountId,
			},
		});
	});

	const dbToGql = (item: ContactWithSegment): FlowContactFragment => ({
		id: item.id,
		first_name: item.first_name,
		last_name: item.last_name,
		phone: item.phone,
		email: item.email,
		segments: item.flow_contact_flow_contact_segment.map((v) => ({
			id: v.flow_contact_segment!.id,
			label: v.flow_contact_segment!.label,
		})),
		status: item.status as FlowContactStatus,
		date_created: item.date_created?.toISOString(),
		date_updated: item.date_updated ? item.date_updated.toISOString() : null,
	});

	describe('Batch update', () => {
		it('cant update without auth', async () => {
			await expect(
				environment.privateApiClient.query<
					BatchUpdateFlowContactMutation,
					BatchUpdateFlowContactMutationVariables
				>(BATCH_UPDATE_FLOW_CONTACT, {
					input: [
						{
							id: flowContact01.id,
							status: FlowContactStatus.Active,
						},
						{
							id: flowContact01.id,
							status: FlowContactStatus.Inactive,
						},
					],
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant update without user account manager permission', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);

			await expect(
				environment.privateApiClient.query<
					BatchUpdateFlowContactMutation,
					BatchUpdateFlowContactMutationVariables
				>(BATCH_UPDATE_FLOW_CONTACT, {
					input: [
						{
							id: flowContact01.id,
							status: FlowContactStatus.Active,
						},
						{
							id: flowContact01.id,
							status: FlowContactStatus.Inactive,
						},
					],
				}),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('cant update a item that is not in your account', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountManager.id,
				userAccountManager.email,
			);

			await expect(
				environment.privateApiClient.query<
					BatchUpdateFlowContactMutation,
					BatchUpdateFlowContactMutationVariables
				>(BATCH_UPDATE_FLOW_CONTACT, {
					input: [
						{
							id: flowContact01.id,
							status: FlowContactStatus.Active,
						},
						{
							id: flowContactIntoAnotherAccount.id,
							status: FlowContactStatus.Active,
						},
					],
				}),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);

			const item = await environment.prisma.flow_contact.findUnique({
				where: {
					id: flowContactIntoAnotherAccount.id,
				},
			});

			// Hasn't been updated
			expect(item?.status).toBe(FlowContactStatus.Inactive);
		});

		it('update', async () => {
			const { data } = await environment.privateApiClient.query<
				BatchUpdateFlowContactMutation,
				BatchUpdateFlowContactMutationVariables
			>(BATCH_UPDATE_FLOW_CONTACT, {
				input: [
					{
						id: flowContact01.id,
						status: FlowContactStatus.Active,
					},
					{
						id: flowContact02.id,
						status: FlowContactStatus.Active,
					},
				],
			});

			expect(data.batchUpdateFlowContact).toEqual(<FlowContactFragment[]>[
				{
					...dbToGql(flowContact01),
					date_updated: expect.any(String),
					status: FlowContactStatus.Active,
				},
				{
					...dbToGql(flowContact02),
					date_updated: expect.any(String),
					status: FlowContactStatus.Active,
				},
			]);
		});
	});

	describe('Toggle Flow Contact In Segment', () => {
		it('cant toggle without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<
					ToggleFlowContactInSegmentMutation,
					ToggleFlowContactInSegmentMutationVariables
				>(TOGGLE_FLOW_CONTACT_IN_SEGMENT, {
					input: {
						contactId: [flowContact01.id],
						mode: ToggleFlowContactInSegmentMode.Add,
						segmentId: segment.id,
					},
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant toggle for a contact that is not in your account', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountManager.id,
				userAccountManager.email,
			);

			await expect(
				environment.privateApiClient.query<
					ToggleFlowContactInSegmentMutation,
					ToggleFlowContactInSegmentMutationVariables
				>(TOGGLE_FLOW_CONTACT_IN_SEGMENT, {
					input: {
						contactId: [flowContactIntoAnotherAccount.id],
						mode: ToggleFlowContactInSegmentMode.Add,
						segmentId: segment.id,
					},
				}),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('cant toggle for a segment that is not in your account', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountManager.id,
				userAccountManager.email,
			);

			await expect(
				environment.privateApiClient.query<
					ToggleFlowContactInSegmentMutation,
					ToggleFlowContactInSegmentMutationVariables
				>(TOGGLE_FLOW_CONTACT_IN_SEGMENT, {
					input: {
						contactId: [flowContact01.id],
						mode: ToggleFlowContactInSegmentMode.Add,
						segmentId: segmentIntoAnotherAccount.id,
					},
				}),
			).rejects.toThrowError(
				new ValidationError('error.contact-and-segment-accounts-must-be-the-same')
					.message,
			);
		});

		let fragments: [FlowContactFragment, FlowContactFragment];

		it('add contacts to segment', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountManager.id,
				userAccountManager.email,
			);

			const atDb01 = await environment.prisma.flow_contact.findUnique({
					where: {
						id: flowContact01.id,
					},
					include: {
						flow_contact_flow_contact_segment: {
							include: {
								flow_contact_segment: true,
							},
						},
					},
				}),
				atDb02 = await environment.prisma.flow_contact.findUnique({
					where: {
						id: flowContact02.id,
					},
					include: {
						flow_contact_flow_contact_segment: {
							include: {
								flow_contact_segment: true,
							},
						},
					},
				});

			fragments = [dbToGql(atDb01!), dbToGql(atDb02!)];

			const { data } = await environment.privateApiClient.query<
				ToggleFlowContactInSegmentMutation,
				ToggleFlowContactInSegmentMutationVariables
			>(TOGGLE_FLOW_CONTACT_IN_SEGMENT, {
				input: {
					contactId: [flowContact01.id, flowContact02.id],
					mode: ToggleFlowContactInSegmentMode.Add,
					segmentId: segment.id,
				},
			});

			expect(data.toggleFlowContactInSegment).toEqual([
				{
					...fragments[0],
					segments: <FlowContactFragment['segments']>[
						{
							id: segment.id,
							label: segment.label,
						},
					],
				},
				{
					...fragments[1],
					segments: <FlowContactFragment['segments']>[
						{
							id: segment.id,
							label: segment.label,
						},
					],
				},
			]);
		});

		it('add to another segment', async () => {
			const { data } = await environment.privateApiClient.query<
				ToggleFlowContactInSegmentMutation,
				ToggleFlowContactInSegmentMutationVariables
			>(TOGGLE_FLOW_CONTACT_IN_SEGMENT, {
				input: {
					contactId: [flowContact01.id, flowContact02.id],
					mode: ToggleFlowContactInSegmentMode.Add,
					segmentId: segment02.id,
				},
			});

			expect(data.toggleFlowContactInSegment).toEqual([
				{
					...fragments[0],
					segments: <FlowContactFragment['segments']>[
						{
							id: segment.id,
							label: segment.label,
						},
						{
							id: segment02.id,
							label: segment02.label,
						},
					],
				},
				{
					...fragments[1],
					segments: <FlowContactFragment['segments']>[
						{
							id: segment.id,
							label: segment.label,
						},
						{
							id: segment02.id,
							label: segment02.label,
						},
					],
				},
			]);
		});

		it('remove from first segment', async () => {
			const { data } = await environment.privateApiClient.query<
				ToggleFlowContactInSegmentMutation,
				ToggleFlowContactInSegmentMutationVariables
			>(TOGGLE_FLOW_CONTACT_IN_SEGMENT, {
				input: {
					contactId: [flowContact01.id, flowContact02.id],
					mode: ToggleFlowContactInSegmentMode.Remove,
					segmentId: segment.id,
				},
			});

			expect(data.toggleFlowContactInSegment).toEqual([
				{
					...fragments[0],
					segments: <FlowContactFragment['segments']>[
						{
							id: segment02.id,
							label: segment02.label,
						},
					],
				},
				{
					...fragments[1],
					segments: <FlowContactFragment['segments']>[
						{
							id: segment02.id,
							label: segment02.label,
						},
					],
				},
			]);
		});
	});
});
