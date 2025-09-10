import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { Prisma, flow_contact, flow_contact_segment, user } from '@prisma/client';
import { AccountUsageKind } from 'src/graphql';
import { UserNotAAccountMemberError } from 'src/shared/errors';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { PAGINATED_FLOW_CONTACTS } from 'test/shared/gql/private/flow-contacts';
import {
	FilterOperator,
	FlowContactFragment,
	FlowContactStatus,
	PaginatedFlowContactsQuery,
	PaginatedFlowContactsQueryVariables,
	SortOrder,
} from 'test/shared/test-gql-private-api-schema.ts';
import { UserWithAccounts } from 'test/shared/utils/create-user-as-account-owner';
import { createUserAsAccountMemberWithSubscription } from 'test/shared/utils/create-user-as-account-with-subscription-member';
import { createUserWithoutAccount } from 'test/shared/utils/create-user-without-account';
import { v4 } from 'uuid';

describe('Paginated Flow Contacts List', () => {
	let environment: TestEnvironment,
		userAccountMember: UserWithAccounts,
		userWithoutAccount: user,
		flowContactSegment: flow_contact_segment,
		secondFlowContactSegment: flow_contact_segment,
		accountId: number;

	const createdFlowContacts: (flow_contact & {
		flow_contact_flow_contact_segment: {
			flow_contact_segment: flow_contact_segment | null;
		}[];
	})[] = [];

	beforeAll(async () => {
		environment = await setupTestEnvironment();

		userAccountMember = await createUserAsAccountMemberWithSubscription(environment, {
			subscriptionPlanInput: {
				name: 'Plan',
				allowed_modules: [AccountUsageKind.flow],
			},
			subscriptionInput: {},
		});
		accountId = userAccountMember.account_user[0].account_id!;

		userWithoutAccount = await createUserWithoutAccount(environment);

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

		const contact = (): Prisma.flow_contactCreateArgs['data'] => ({
				id: v4(),
				account: accountId,
				status: FlowContactStatus.Active,
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

		// Create 1 contact for segment 1
		createdFlowContacts.push(
			await environment.prisma.flow_contact.create({
				data: {
					...contact(),
					flow_contact_flow_contact_segment: {
						create: {
							flow_contact_segment_id: flowContactSegment.id,
						},
					},
				},
				include,
			}),
		);
		// Create 1 contact for segment 2
		createdFlowContacts.push(
			await environment.prisma.flow_contact.create({
				data: {
					...contact(),
					flow_contact_flow_contact_segment: {
						create: {
							flow_contact_segment_id: secondFlowContactSegment.id,
						},
					},
				},
				include,
			}),
		);
		// Create 1 contact for segment 2 with status inactive
		createdFlowContacts.push(
			await environment.prisma.flow_contact.create({
				data: {
					...contact(),
					status: FlowContactStatus.Inactive,
					flow_contact_flow_contact_segment: {
						create: {
							flow_contact_segment_id: secondFlowContactSegment.id,
						},
					},
				},
				include,
			}),
		);

		// Create 1 contact in both segments
		createdFlowContacts.push(
			await environment.prisma.flow_contact.create({
				data: {
					...contact(),
					flow_contact_flow_contact_segment: {
						create: [
							{
								flow_contact_segment_id: flowContactSegment.id,
							},
							{
								flow_contact_segment_id: secondFlowContactSegment.id,
							},
						],
					},
				},
				include,
			}),
		);
	});

	const getSpecificFlowContact = (
		name:
			| 'active_in_first_segment'
			| 'active_in_second_segment'
			| 'inactive_in_second_segment'
			| 'active_in_both_segments',
	) => {
		switch (name) {
			case 'active_in_first_segment':
				return createdFlowContacts[0];
			case 'active_in_second_segment':
				return createdFlowContacts[1];
			case 'inactive_in_second_segment':
				return createdFlowContacts[2];
			case 'active_in_both_segments':
				return createdFlowContacts[3];
		}
	};

	afterAll(async () => {
		await environment.close();
	});

	it('cant list without auth', async () => {
		await expect(
			environment.privateApiClient.query<
				PaginatedFlowContactsQuery,
				PaginatedFlowContactsQueryVariables
			>(PAGINATED_FLOW_CONTACTS, {
				accountId,
			}),
		).rejects.toThrowError(new UnauthorizedException().message);
	});

	it('cant list without been a account member', async () => {
		environment.privateApiClient.authenticateAsUser(
			userWithoutAccount.id,
			userWithoutAccount.email,
		);

		await expect(
			environment.privateApiClient.query<
				PaginatedFlowContactsQuery,
				PaginatedFlowContactsQueryVariables
			>(PAGINATED_FLOW_CONTACTS, {
				accountId,
			}),
		).rejects.toThrowError(new UserNotAAccountMemberError().message);
	});

	const dbToGql = (item: (typeof createdFlowContacts)[number]): FlowContactFragment => ({
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

	it('list items without pagination or filter', async () => {
		environment.privateApiClient.authenticateAsUser(
			userAccountMember.id,
			userAccountMember.email,
		);

		const { data } = await environment.privateApiClient.query<
			PaginatedFlowContactsQuery,
			PaginatedFlowContactsQueryVariables
		>(PAGINATED_FLOW_CONTACTS, {
			accountId,
		});

		expect(data.accountFlowContacts?.totalItems).toBe(4);
		expect(data.accountFlowContacts?.items).toHaveLength(4);
		expect(data.accountFlowContacts?.items).toEqual(
			expect.arrayContaining(<FlowContactFragment[]>createdFlowContacts.map(dbToGql)),
		);
	});

	it('list items with status filter', async () => {
		environment.privateApiClient.authenticateAsUser(
			userAccountMember.id,
			userAccountMember.email,
		);

		const { data } = await environment.privateApiClient.query<
			PaginatedFlowContactsQuery,
			PaginatedFlowContactsQueryVariables
		>(PAGINATED_FLOW_CONTACTS, {
			accountId,
			filter: {
				operator: FilterOperator.And,
				status: FlowContactStatus.Inactive,
			},
		});

		expect(data.accountFlowContacts?.totalItems).toBe(1);
		expect(data.accountFlowContacts?.items).toHaveLength(1);
		expect(data.accountFlowContacts?.items).toEqual([
			dbToGql(getSpecificFlowContact('inactive_in_second_segment')),
		]);
	});

	it('list items with segment filter', async () => {
		const { data } = await environment.privateApiClient.query<
			PaginatedFlowContactsQuery,
			PaginatedFlowContactsQueryVariables
		>(PAGINATED_FLOW_CONTACTS, {
			accountId,
			filter: {
				operator: FilterOperator.And,
				segment: secondFlowContactSegment.id,
			},
		});

		expect(data.accountFlowContacts?.totalItems).toBe(3);
		expect(data.accountFlowContacts?.items).toHaveLength(3);
		expect(data.accountFlowContacts?.items).toEqual(
			expect.arrayContaining([
				dbToGql(getSpecificFlowContact('active_in_second_segment')),
				dbToGql(getSpecificFlowContact('inactive_in_second_segment')),
				dbToGql(getSpecificFlowContact('active_in_both_segments')),
			]),
		);
	});

	it('list items with email filter', async () => {
		const { data } = await environment.privateApiClient.query<
			PaginatedFlowContactsQuery,
			PaginatedFlowContactsQueryVariables
		>(PAGINATED_FLOW_CONTACTS, {
			accountId,
			filter: {
				operator: FilterOperator.And,
				search: createdFlowContacts[0].email!.slice(0, -2),
			},
		});

		expect(data.accountFlowContacts?.totalItems).toBe(1);
		expect(data.accountFlowContacts?.items).toHaveLength(1);
		expect(data.accountFlowContacts?.items).toEqual([dbToGql(createdFlowContacts[0])]);
	});

	it('list items with phone filter', async () => {
		const { data } = await environment.privateApiClient.query<
			PaginatedFlowContactsQuery,
			PaginatedFlowContactsQueryVariables
		>(PAGINATED_FLOW_CONTACTS, {
			accountId,
			filter: {
				operator: FilterOperator.And,
				search: createdFlowContacts[1].phone.slice(0, -2),
			},
		});

		expect(data.accountFlowContacts?.totalItems).toBe(1);
		expect(data.accountFlowContacts?.items).toHaveLength(1);
		expect(data.accountFlowContacts?.items).toEqual([dbToGql(createdFlowContacts[1])]);
	});

	it('list items with name filter', async () => {
		const { data } = await environment.privateApiClient.query<
			PaginatedFlowContactsQuery,
			PaginatedFlowContactsQueryVariables
		>(PAGINATED_FLOW_CONTACTS, {
			accountId,
			filter: {
				operator: FilterOperator.And,
				search: `${
					createdFlowContacts[3].first_name
				} ${createdFlowContacts[3].last_name.slice(0, -2)}`,
			},
		});

		expect(data.accountFlowContacts?.totalItems).toBe(1);
		expect(data.accountFlowContacts?.items).toHaveLength(1);
		expect(data.accountFlowContacts?.items).toEqual([dbToGql(createdFlowContacts[3])]);
	});

	it('list items with operator AND', async () => {
		const { data } = await environment.privateApiClient.query<
			PaginatedFlowContactsQuery,
			PaginatedFlowContactsQueryVariables
		>(PAGINATED_FLOW_CONTACTS, {
			accountId,
			filter: {
				operator: FilterOperator.And,
				segment: secondFlowContactSegment.id,
				status: FlowContactStatus.Active,
			},
		});

		expect(data.accountFlowContacts?.totalItems).toBe(2);
		expect(data.accountFlowContacts?.items).toHaveLength(2);
		expect(data.accountFlowContacts?.items).toEqual(
			expect.arrayContaining([
				dbToGql(getSpecificFlowContact('active_in_second_segment')),
				dbToGql(getSpecificFlowContact('active_in_both_segments')),
			]),
		);
	});

	it('list items with operator OR', async () => {
		const { data } = await environment.privateApiClient.query<
			PaginatedFlowContactsQuery,
			PaginatedFlowContactsQueryVariables
		>(PAGINATED_FLOW_CONTACTS, {
			accountId,
			filter: {
				operator: FilterOperator.Or,
				segment: flowContactSegment.id,
				status: FlowContactStatus.Inactive,
			},
		});

		expect(data.accountFlowContacts?.totalItems).toBe(3);
		expect(data.accountFlowContacts?.items).toHaveLength(3);
		expect(data.accountFlowContacts?.items).toEqual(
			expect.arrayContaining([
				dbToGql(getSpecificFlowContact('active_in_first_segment')),
				dbToGql(getSpecificFlowContact('active_in_both_segments')),
				dbToGql(getSpecificFlowContact('inactive_in_second_segment')),
			]),
		);
	});

	it('list items with sort and take', async () => {
		const { data } = await environment.privateApiClient.query<
			PaginatedFlowContactsQuery,
			PaginatedFlowContactsQueryVariables
		>(PAGINATED_FLOW_CONTACTS, {
			accountId,
			pagination: {
				take: 2,
				sort: {
					date_created: SortOrder.Asc,
				},
			},
		});

		expect(data.accountFlowContacts?.totalItems).toBe(4);
		expect(data.accountFlowContacts?.items).toEqual([
			dbToGql(createdFlowContacts[0]),
			dbToGql(createdFlowContacts[1]),
		]);
	});

	it('list items with sort and skip', async () => {
		const { data } = await environment.privateApiClient.query<
			PaginatedFlowContactsQuery,
			PaginatedFlowContactsQueryVariables
		>(PAGINATED_FLOW_CONTACTS, {
			accountId,
			pagination: {
				skip: 2,
				sort: {
					date_created: SortOrder.Desc,
				},
			},
		});

		expect(data.accountFlowContacts?.totalItems).toBe(4);
		expect(data.accountFlowContacts?.items).toEqual([
			// order by sort is: 3,2,1,0. With skip, only 1,0
			dbToGql(createdFlowContacts[1]),
			dbToGql(createdFlowContacts[0]),
		]);
	});
});
