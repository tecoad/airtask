import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';
import { FlowAgentEditorType, FlowStatus, FlowType } from 'src/graphql';
import { TestEnvironment } from 'test/config/setup-test-environment';
import { v4 } from 'uuid';

export const createFlowForAccount = async (
	environment: TestEnvironment,
	data: {
		accountId: number;
		flowInput?: Partial<Prisma.flowCreateInput>;
	},
) => {
	const { flowInput, accountId } = data;

	const flowAgent = await environment.prisma.flow_agent.create({
		data: {
			id: v4(),
			account: accountId,
			editor_type: FlowAgentEditorType.advanced,
			title: 'Title',
		},
	});
	const flowContactSegment = await environment.prisma.flow_contact_segment.create({
		data: {
			id: v4(),
			account: accountId,
			label: 'Label',
		},
	});

	return {
		flow: await environment.prisma.flow.create({
			data: {
				id: v4(),
				name: faker.lorem.words(3),
				daily_budget: 1,
				status: FlowStatus.active,
				type: FlowType.outbound,
				account: accountId,
				agent: flowAgent.id,
				segment: flowContactSegment.id,
				...(flowInput as any),
			},
		}),
		agent: flowAgent,
		segment: flowContactSegment,
	};
};
