import gql from 'graphql-tag';

export const START_SIMULATION_MODE = gql`
	mutation StartSimulationMode($focusUserId: ID!) {
		startSimulationMode(focusUserId: $focusUserId) {
			id
		}
	}
`;
