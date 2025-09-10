import { DefaultItem, FileItem } from '@directus/sdk';
import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { flow, flow_interaction, flow_interaction_recording, user } from '@prisma/client';
import { createReadStream } from 'fs';
import * as path from 'path';
import { AccountUsageKind, FlowAgentEditorType, FlowStatus, FlowType } from 'src/graphql';
import { AssetsService } from 'src/modules/assets/services/assets.service';
import { UserNotAAccountMemberError } from 'src/shared/errors';
import { FlowInteractionStatus } from 'src/shared/types/db';
import { Sleep } from 'src/shared/utils/any';
import {
	TestEnvironment,
	setupTestEnvironment,
} from 'test/config/setup-test-environment';
import { FLOW_RECORDINGS } from 'test/shared/gql/private/flow-recording';
import {
	FilterOperator,
	FlowRecordingFragment,
	FlowRecordingsQuery,
	FlowRecordingsQueryVariables,
	SortOrder,
} from 'test/shared/test-gql-private-api-schema.ts';
import { UserWithAccounts } from 'test/shared/utils/create-user-as-account-owner';
import { createUserAsAccountMemberWithSubscription } from 'test/shared/utils/create-user-as-account-with-subscription-member';
import { createUserWithoutAccount } from 'test/shared/utils/create-user-without-account';
import { v4 } from 'uuid';

type HydratedFlowRecording = flow_interaction_recording & {
	flow_interaction?:
		| (flow_interaction & {
				flow_flow_interaction_flowToflow?: flow | null;
		  })
		| null;
};

describe('Paginated Flow Recording', () => {
	let environment: TestEnvironment,
		userAccountMember: UserWithAccounts,
		userWithoutAccount: user,
		flow: flow,
		secondFlow: flow,
		recordingFile: DefaultItem<FileItem>,
		accountId: number;

	const createdRecordings: HydratedFlowRecording[] = [];

	const getSpecificRecording = (
		name:
			| 'in_first_flow'
			| 'in_second_flow'
			| 'in_first_flow_with_duration_5'
			| 'in_second_flow_with_duration_30',
	) => {
		switch (name) {
			case 'in_first_flow':
				return createdRecordings[0];
			case 'in_second_flow':
				return createdRecordings[1];
			case 'in_first_flow_with_duration_5':
				return createdRecordings[2];
			case 'in_second_flow_with_duration_30':
				return createdRecordings[3];
		}
	};
	const dbToGql = (db: HydratedFlowRecording): FlowRecordingFragment => ({
		id: db.id,
		contact_name: db.flow_interaction!.contact_name,
		contact_phone: db.flow_interaction!.contact_phone,
		date_created: db.date_created?.toISOString(),
		duration: db.duration,
		flow: {
			id: db.flow_interaction!.flow_flow_interaction_flowToflow!.id,
			name: db.flow_interaction!.flow_flow_interaction_flowToflow!.name,
		},
		record: expect.objectContaining(<Partial<FlowRecordingFragment['record']>>{
			id: recordingFile.id,
			url: expect.stringContaining(recordingFile.id),
		}),
	});

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

		recordingFile = await environment.app
			.get(AssetsService)
			.uploadFile(
				createReadStream(path.join(process.cwd(), 'test', 'mocks', 'image-example.png')),
			);

		// Create agent to link to flows
		const agent = await environment.prisma.flow_agent.create({
			data: {
				id: v4(),
				editor_type: FlowAgentEditorType.advanced,
				title: 'Agent',
				account: accountId,
			},
		});
		// create one segment to link to flows
		const segment = await environment.prisma.flow_contact_segment.create({
			data: {
				id: v4(),
				label: 'Segment',
				account: accountId,
			},
		});

		// Create first flow
		flow = await environment.prisma.flow.create({
			data: {
				id: v4(),
				daily_budget: 0,
				name: 'First Flow',
				status: FlowStatus.active,
				type: FlowType.inbound,
				account: accountId,
				agent: agent.id,
				segment: segment.id,
			},
		});
		const interactionForFirstFlow = await environment.prisma.flow_interaction.create({
			data: {
				id: v4(),
				contact_name: faker.name.fullName(),
				contact_phone: faker.phone.number(),
				account: accountId,
				agent: agent.id,
				flow: flow.id,
				status: FlowInteractionStatus.Requested,
			},
		});

		secondFlow = await environment.prisma.flow.create({
			data: {
				id: v4(),
				daily_budget: 0,
				name: 'First Flow',
				status: FlowStatus.active,
				type: FlowType.inbound,
				account: accountId,
				agent: agent.id,
				segment: segment.id,
			},
		});
		const interactionForSecondFlow = await environment.prisma.flow_interaction.create({
			data: {
				id: v4(),
				contact_name: faker.name.fullName(),
				contact_phone: faker.phone.number(),
				account: accountId,
				agent: agent.id,
				flow: secondFlow.id,
				status: FlowInteractionStatus.Requested,
			},
		});

		const include = {
			flow_interaction: {
				include: {
					flow_flow_interaction_flowToflow: true,
				},
			},
		};

		createdRecordings.push(
			// Create first recording that is in first flow
			await environment.prisma.flow_interaction_recording.create({
				data: {
					id: v4(),
					duration: 100,
					account: accountId,
					file: recordingFile.id,
					interaction: interactionForFirstFlow.id,
				},
				include,
			}),
		);

		await Sleep(100);

		createdRecordings.push(
			// Create second recording that is in second flow
			await environment.prisma.flow_interaction_recording.create({
				data: {
					id: v4(),
					duration: 100,
					account: accountId,
					file: recordingFile.id,
					interaction: interactionForSecondFlow.id,
				},
				include,
			}),
		);

		await Sleep(100);

		createdRecordings.push(
			// first flow recording with duration 5
			await environment.prisma.flow_interaction_recording.create({
				data: {
					id: v4(),
					duration: 5,
					account: accountId,
					file: recordingFile.id,
					interaction: interactionForFirstFlow.id,
				},
				include,
			}),
		);

		await Sleep(100);

		createdRecordings.push(
			// second flow recording with duration 30
			await environment.prisma.flow_interaction_recording.create({
				data: {
					id: v4(),
					duration: 30,
					account: accountId,
					file: recordingFile.id,
					interaction: interactionForSecondFlow.id,
				},
				include,
			}),
		);
	});

	afterAll(async () => {
		await environment.app
			.get(AssetsService)
			.deleteFile(recordingFile.id)
			.catch(() => ({}));
		await environment?.close();
	});

	describe('Authorization', () => {
		it('cant query without auth', async () => {
			await expect(
				environment.privateApiClient.query<
					FlowRecordingsQuery,
					FlowRecordingsQueryVariables
				>(FLOW_RECORDINGS, {
					accountId,
				}),
			).rejects.toThrowError(new UnauthorizedException().message);
		});

		it('cant query without account member permission', async () => {
			environment.privateApiClient.authenticateAsUser(
				userWithoutAccount.id,
				userWithoutAccount.email,
			);

			await expect(
				environment.privateApiClient.query<
					FlowRecordingsQuery,
					FlowRecordingsQueryVariables
				>(FLOW_RECORDINGS, {
					accountId,
				}),
			).rejects.toThrowError(new UserNotAAccountMemberError().message);
		});
	});

	describe('Query', () => {
		it('query without any filter', async () => {
			environment.privateApiClient.authenticateAsUser(
				userAccountMember.id,
				userAccountMember.email,
			);

			const { data } = await environment.privateApiClient.query<
				FlowRecordingsQuery,
				FlowRecordingsQueryVariables
			>(FLOW_RECORDINGS, {
				accountId,
			});

			expect(data.flowRecordings.totalItems).toBe(createdRecordings.length);
			expect(data.flowRecordings.items).toEqual(createdRecordings.map(dbToGql));
		});

		describe('Filter', () => {
			it('filter by flow', async () => {
				const { data } = await environment.privateApiClient.query<
					FlowRecordingsQuery,
					FlowRecordingsQueryVariables
				>(FLOW_RECORDINGS, {
					accountId,
					filter: {
						operator: FilterOperator.And,
						flow: flow.id,
					},
					pagination: {
						sort: {
							date_created: SortOrder.Asc,
						},
					},
				});

				expect(data.flowRecordings.totalItems).toBe(2);
				expect(data.flowRecordings.items).toEqual([
					dbToGql(getSpecificRecording('in_first_flow')),
					dbToGql(getSpecificRecording('in_first_flow_with_duration_5')),
				]);
			});

			it('filter by flow and duration', async () => {
				const { data } = await environment.privateApiClient.query<
					FlowRecordingsQuery,
					FlowRecordingsQueryVariables
				>(FLOW_RECORDINGS, {
					accountId,
					filter: {
						operator: FilterOperator.And,
						flow: flow.id,
						duration: {
							lte: 10,
						},
					},
				});

				expect(data.flowRecordings.totalItems).toBe(1);
				expect(data.flowRecordings.items).toEqual([
					dbToGql(getSpecificRecording('in_first_flow_with_duration_5')),
				]);
			});

			it('filter operator works', async () => {
				const { data } = await environment.privateApiClient.query<
					FlowRecordingsQuery,
					FlowRecordingsQueryVariables
				>(FLOW_RECORDINGS, {
					accountId,
					filter: {
						operator: FilterOperator.Or,
						flow: flow.id,
						duration: {
							lte: 10,
						},
					},
				});

				expect(data.flowRecordings.totalItems).toBe(2);
				expect(data.flowRecordings.items).toHaveLength(2);
				expect(data.flowRecordings.items).toEqual(
					expect.arrayContaining([
						dbToGql(getSpecificRecording('in_first_flow')),
						dbToGql(getSpecificRecording('in_first_flow_with_duration_5')),
					]),
				);
			});

			it('filter by date', async () => {
				const { data } = await environment.privateApiClient.query<
					FlowRecordingsQuery,
					FlowRecordingsQueryVariables
				>(FLOW_RECORDINGS, {
					accountId,
					filter: {
						operator: FilterOperator.And,
						date_created: {
							gt: createdRecordings[0].date_created?.toISOString(),
							lt: createdRecordings[2].date_created?.toISOString(),
						},
					},
				});

				expect(data.flowRecordings.totalItems).toBe(1);
				expect(data.flowRecordings.items).toEqual([dbToGql(createdRecordings[1])]);
			});

			it('filter by contact name', async () => {
				const { data } = await environment.privateApiClient.query<
					FlowRecordingsQuery,
					FlowRecordingsQueryVariables
				>(FLOW_RECORDINGS, {
					accountId,
					filter: {
						operator: FilterOperator.And,
						contact_search:
							getSpecificRecording('in_first_flow').flow_interaction?.contact_name,
					},
				});

				expect(data.flowRecordings.totalItems).toBe(2);
				expect(data.flowRecordings.items).toEqual([
					dbToGql(getSpecificRecording('in_first_flow')),
					dbToGql(getSpecificRecording('in_first_flow_with_duration_5')),
				]);
			});

			it('filter by contact phone', async () => {
				const { data } = await environment.privateApiClient.query<
					FlowRecordingsQuery,
					FlowRecordingsQueryVariables
				>(FLOW_RECORDINGS, {
					accountId,
					filter: {
						operator: FilterOperator.And,
						contact_search:
							getSpecificRecording('in_second_flow').flow_interaction?.contact_phone,
					},
				});

				expect(data.flowRecordings.totalItems).toBe(2);
				expect(data.flowRecordings.items).toEqual([
					dbToGql(getSpecificRecording('in_second_flow')),
					dbToGql(getSpecificRecording('in_second_flow_with_duration_30')),
				]);
			});
		});

		describe('Sort', () => {
			it('sort by date created asc', async () => {
				const { data } = await environment.privateApiClient.query<
					FlowRecordingsQuery,
					FlowRecordingsQueryVariables
				>(FLOW_RECORDINGS, {
					accountId,
					pagination: {
						sort: {
							date_created: SortOrder.Asc,
						},
					},
				});

				expect(data.flowRecordings.totalItems).toBe(createdRecordings.length);
				expect(data.flowRecordings.items).toEqual(createdRecordings.map(dbToGql));
			});

			it('sort by date created desc', async () => {
				const { data } = await environment.privateApiClient.query<
					FlowRecordingsQuery,
					FlowRecordingsQueryVariables
				>(FLOW_RECORDINGS, {
					accountId,
					pagination: {
						sort: {
							date_created: SortOrder.Desc,
						},
					},
				});

				expect(data.flowRecordings.totalItems).toBe(createdRecordings.length);
				expect(data.flowRecordings.items).toEqual(
					createdRecordings.reverse().map(dbToGql),
				);
			});
		});
	});
});
