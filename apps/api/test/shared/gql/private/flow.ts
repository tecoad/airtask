import gql from 'graphql-tag';
import { FLOW_FRAGMENT } from './flow-fragments';

export const CREATE_FLOW = gql`
	mutation CreateFlow($input: CreateFlowInput!) {
		createFlow(input: $input) {
			...Flow
		}
	}
	${FLOW_FRAGMENT}
`;

export const UPDATE_FLOW = gql`
	mutation UpdateFlow($input: UpdateFlowInput!) {
		updateFlow(input: $input) {
			...Flow
		}
	}
	${FLOW_FRAGMENT}
`;

export const ACCOUNT_FLOWS = gql`
	query AccountFlows($accountId: ID!) {
		accountFlows(accountId: $accountId) {
			...Flow
		}
	}
	${FLOW_FRAGMENT}
`;

export const ACCOUNT_FLOW = gql`
	query AccountFlow($accountFlowId: ID!) {
		accountFlow(id: $accountFlowId) {
			...Flow
		}
	}
	${FLOW_FRAGMENT}
`;

export const DELETE_FLOW = gql`
	mutation DeleteFlow($deleteFlowId: ID!) {
		deleteFlow(id: $deleteFlowId)
	}
`;
