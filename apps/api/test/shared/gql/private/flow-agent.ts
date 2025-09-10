import gql from 'graphql-tag';
import { FLOW_AGENT_FRAGMENT } from './flow-agent-fragments';

export const CREATE_FLOW_AGENT = gql`
	mutation CreateFlowAgent($input: CreateFlowAgentInput!) {
		createFlowAgent(input: $input) {
			...FlowAgent
		}
	}
	${FLOW_AGENT_FRAGMENT}
`;

export const UPDATE_FLOW_AGENT = gql`
	mutation UpdateFlowAgent($input: UpdateFlowAgentInput!) {
		updateFlowAgent(input: $input) {
			...FlowAgent
		}
	}
	${FLOW_AGENT_FRAGMENT}
`;

export const ACCOUNT_FLOW_AGENT = gql`
	query AccountFlowAgent($accountFlowAgentId: ID!) {
		accountFlowAgent(id: $accountFlowAgentId) {
			...FlowAgent
		}
	}
	${FLOW_AGENT_FRAGMENT}
`;

export const ACCOUNT_FLOW_AGENTS = gql`
	query AccountFlowAgents($account: ID!) {
		accountFlowAgents(account: $account) {
			...FlowAgent
		}
	}
	${FLOW_AGENT_FRAGMENT}
`;

export const DELETE_FLOW_AGENT = gql`
	mutation DeleteFlowAgent($deleteFlowAgentId: ID!) {
		deleteFlowAgent(id: $deleteFlowAgentId)
	}
`;
