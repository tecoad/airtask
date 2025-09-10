import { gql } from '@apollo/client';

export const ONBOARDING_STEP_FRAGMENT = gql`
	fragment OnBoardingStep on OnBoardingStep {
		id
		name
		date_created
	}
`;
