import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { Prisma, flow, user } from '@prisma/client';
import { ValidationError } from 'apollo-server-express';
import {
	AccountRole,
	AccountUsageKind,
	FlowAgentEditorType,
	FlowStatus,
	FlowType,
} from 'src/graphql';
import { UserNotAAccountMemberError } from 'src/shared/errors';
import { UserNotAccountManagerError } from 'src/shared/errors/user-not-the-account-owner.error';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { DELETE_FLOW } from 'test/shared/gql/private/flow';
import { PAGINATED_FLOW_CONTACTS } from 'test/shared/gql/private/flow-contacts';
import {
	ACCOUNT_FLOW_SEGMENTS,
	CREATE_FLOW_CONTACT_SEGMENT,
	DELETE_FLOW_SEGMENT,
	FLOW_SEGMENT,
	UPDATE_FLOW_SEGMENT,
} from 'test/shared/gql/private/flow-contacts-segments';
import {
	AccountFlowSegmentQuery,
	AccountFlowSegmentQueryVariables,
	AccountFlowSegmentsQuery,
	AccountFlowSegmentsQueryVariables,
	CreateFlowContactSegmentMutation,
	CreateFlowContactSegmentMutationVariables,
	DeleteFlowMutation,
	DeleteFlowMutationVariables,
	DeleteFlowSegmentMutation,
	DeleteFlowSegmentMutationVariables,
	FilterOperator,
	FlowContactSegmentFragment,
	FlowContactSegmentWithMetricsFragment,
	FlowContactStatus,
	PaginatedFlowContactsQuery,
	PaginatedFlowContactsQueryVariables,
	UpdateFlowContactSegmentMutation,
	UpdateFlowContactSegmentMutationVariables,
} from 'test/shared/test-gql-private-api-schema.ts';
import { createUserAsAccountMember } from 'test/shared/utils/create-user-as-account-member';
import { UserWithAccounts } from 'test/shared/utils/create-user-as-account-owner';
import { createUserAsAccountMemberWithSubscription } from 'test/shared/utils/create-user-as-account-with-subscription-member';
import { createUserWithoutAccount } from 'test/shared/utils/create-user-without-account';
import { v4 } from 'uuid';

jest.setTimeout(40000);

describe('Flow Contact Segments', () => {
	let environment: TestEnvironment,
		userAccountOwner: UserWithAccounts,
		userAccountMember: UserWithAccounts,
		userWithoutAccount: user,
		accountId: number;

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
		userWithoutAccount = await createUserWithoutAccount(environment);
	});

	afterAll(async () => {
		await environment.close();
	});

	let createdItem: FlowContactSegmentFragment;

	describe('Create', () => {
		it('cant create flow contact segment without auth', async () => {
			await expect(
				environment.privateApiClient.query<
					CreateFlowContactSegmentMutation,
					CreateFlowContactSegmentMutationVariables
				>(CREATE_FLOW_CONTACT_SEGMENT, {
					input: {
						account: accountId,
						label: 'Label',
					},
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant create flow contact without account permission', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);
			await expect(
				environment.privateApiClient.query<
					CreateFlowContactSegmentMutation,
					CreateFlowContactSegmentMutationVariables
				>(CREATE_FLOW_CONTACT_SEGMENT, {
					input: {
						account: accountId,
						label: 'Label',
					},
				}),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('create as account owner', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			const { data } = await environment.privateApiClient.query<
				CreateFlowContactSegmentMutation,
				CreateFlowContactSegmentMutationVariables
			>(CREATE_FLOW_CONTACT_SEGMENT, {
				input: {
					account: accountId,
					label: 'Label',
				},
			});

			expect(data.createFlowContactSegment).toEqual({
				id: expect.any(String),
				label: 'Label',
			});

			createdItem = data.createFlowContactSegment;
		});
	});

	let flowToSegment: flow;

	describe('Read', () => {
		it('cant read item without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<
					AccountFlowSegmentQuery,
					AccountFlowSegmentQueryVariables
				>(FLOW_SEGMENT, { accountFlowSegmentId: createdItem.id }),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant read item without account member permission', async () => {
			environment.privateApiClient.authenticateAsUser(
				userWithoutAccount.id,
				userWithoutAccount.email,
			);

			await expect(
				environment.privateApiClient.query<
					AccountFlowSegmentQuery,
					AccountFlowSegmentQueryVariables
				>(FLOW_SEGMENT, { accountFlowSegmentId: createdItem.id }),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('read created item with metrics', async () => {
			// Create 2 contacts and 1 instance using this segment
			const contact = (): Prisma.flow_contactCreateArgs['data'] => ({
				id: v4(),
				account: accountId,
				status: FlowContactStatus.Active,
				email: faker.internet.email(),
				phone: faker.phone.number('+55319########'),
				first_name: faker.name.firstName(),
				last_name: faker.name.lastName(),
			});
			await environment.prisma.flow_contact.create({
				data: {
					...contact(),
					flow_contact_flow_contact_segment: {
						create: {
							flow_contact_segment_id: String(createdItem.id),
						},
					},
				},
			});
			await environment.prisma.flow_contact.create({
				data: {
					...contact(),
					flow_contact_flow_contact_segment: {
						create: {
							flow_contact_segment_id: String(createdItem.id),
						},
					},
				},
			});
			const agent = await environment.prisma.flow_agent.create({
				data: {
					id: v4(),
					account: accountId,
					editor_type: FlowAgentEditorType.advanced,
					title: 'Title',
				},
			});
			flowToSegment = await environment.prisma.flow.create({
				data: {
					id: v4(),
					name: 'Name',
					account: accountId,
					segment: String(createdItem.id),
					type: FlowType.inbound,
					agent: agent.id,
					daily_budget: 0,
					status: FlowStatus.active,
				},
			});

			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);

			const { data } = await environment.privateApiClient.query<
				AccountFlowSegmentQuery,
				AccountFlowSegmentQueryVariables
			>(FLOW_SEGMENT, { accountFlowSegmentId: createdItem.id });

			expect(data.accountFlowSegment).toEqual(<FlowContactSegmentWithMetricsFragment>{
				...createdItem,
				flow_contacts_count: 2,
				flow_instances_count: 1,
			});
		});

		it('cant read item on list without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<
					AccountFlowSegmentsQuery,
					AccountFlowSegmentsQueryVariables
				>(ACCOUNT_FLOW_SEGMENTS, { accountId }),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant read item on list without account member permission', async () => {
			environment.privateApiClient.authenticateAsUser(
				userWithoutAccount.id,
				userWithoutAccount.email,
			);

			await expect(
				environment.privateApiClient.query<
					AccountFlowSegmentsQuery,
					AccountFlowSegmentsQueryVariables
				>(ACCOUNT_FLOW_SEGMENTS, { accountId }),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});

		it('read created item on list', async () => {
			// auth for next suits
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);
			const { data } = await environment.privateApiClient.query<
				AccountFlowSegmentsQuery,
				AccountFlowSegmentsQueryVariables
			>(ACCOUNT_FLOW_SEGMENTS, { accountId });

			expect(data.accountFlowSegments).toEqual([createdItem]);
		});
	});

	describe('Update', () => {
		it('cant update item without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<
					UpdateFlowContactSegmentMutation,
					UpdateFlowContactSegmentMutationVariables
				>(UPDATE_FLOW_SEGMENT, {
					input: {
						id: createdItem.id,
						label: 'Second Label',
					},
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
					UpdateFlowContactSegmentMutation,
					UpdateFlowContactSegmentMutationVariables
				>(UPDATE_FLOW_SEGMENT, {
					input: {
						id: createdItem.id,
						label: 'Second Label',
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
				UpdateFlowContactSegmentMutation,
				UpdateFlowContactSegmentMutationVariables
			>(UPDATE_FLOW_SEGMENT, {
				input: {
					id: createdItem.id,
					label: 'Second Label',
				},
			});

			expect(data.updateFlowContactSegment).toEqual(<FlowContactSegmentFragment>{
				id: createdItem.id,
				label: 'Second Label',
			});

			createdItem = data.updateFlowContactSegment;
		});
	});

	describe('Delete', () => {
		it('cant delete item without auth', async () => {
			environment.privateApiClient.deleteAuthorizationToken();

			await expect(
				environment.privateApiClient.query<
					DeleteFlowSegmentMutation,
					DeleteFlowSegmentMutationVariables
				>(DELETE_FLOW_SEGMENT, {
					deleteFlowSegmentId: createdItem.id,
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
					DeleteFlowSegmentMutation,
					DeleteFlowSegmentMutationVariables
				>(DELETE_FLOW_SEGMENT, {
					deleteFlowSegmentId: createdItem.id,
				}),
			).rejects.toThrowError(new UserNotAccountManagerError().message);
		});

		it('cant delete item that is being used by a flow', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			await expect(
				environment.privateApiClient.query<
					DeleteFlowSegmentMutation,
					DeleteFlowSegmentMutationVariables
				>(DELETE_FLOW_SEGMENT, {
					deleteFlowSegmentId: createdItem.id,
				}),
			).rejects.toThrowError(
				new ValidationError('This segment is being used by a flow').message,
			);

			// Wasn't deleted
			const { data } = await environment.privateApiClient.query<
				AccountFlowSegmentQuery,
				AccountFlowSegmentQueryVariables
			>(FLOW_SEGMENT, { accountFlowSegmentId: createdItem.id });

			expect(data.accountFlowSegment).toEqual(expect.objectContaining(createdItem));

			// Now, delete the flow for next suits
			await environment.privateApiClient.query<
				DeleteFlowMutation,
				DeleteFlowMutationVariables
			>(DELETE_FLOW, {
				deleteFlowId: flowToSegment.id,
			});
		});

		it('delete item', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountOwner.id,
				userAccountOwner.email,
			);

			const { data } = await environment.privateApiClient.query<
				DeleteFlowSegmentMutation,
				DeleteFlowSegmentMutationVariables
			>(DELETE_FLOW_SEGMENT, {
				deleteFlowSegmentId: createdItem.id,
			});

			expect(data.deleteFlowSegment).toBe(true);

			// Still can find item in DB, because its a soft delete
			await environment.prisma.flow_contact_segment.findUniqueOrThrow({
				where: {
					id: String(createdItem.id),
				},
			});

			// The contacts that was in this segments doesn't have any segments anymore
			const res = await environment.privateApiClient.query<
				PaginatedFlowContactsQuery,
				PaginatedFlowContactsQueryVariables
			>(PAGINATED_FLOW_CONTACTS, {
				accountId,
				filter: {
					operator: FilterOperator.And,
					segment: createdItem.id,
				},
			});
			expect(res.data.accountFlowContacts.totalItems).toBe(0);
		});

		it('cant find deleted item from API findUnique', async () => {
			const { data } = await environment.privateApiClient.query<
				AccountFlowSegmentQuery,
				AccountFlowSegmentQueryVariables
			>(FLOW_SEGMENT, { accountFlowSegmentId: createdItem.id });

			expect(data.accountFlowSegment).toBe(null);
		});

		it('cant find deleted item from api findMany', async () => {
			const { data } = await environment.privateApiClient.query<
				AccountFlowSegmentsQuery,
				AccountFlowSegmentsQueryVariables
			>(ACCOUNT_FLOW_SEGMENTS, { accountId });

			expect(data.accountFlowSegments).toHaveLength(0);
		});
	});
});
