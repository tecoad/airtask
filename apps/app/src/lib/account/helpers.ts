import { OnBoardingStep, OnBoardingStepName } from '@/core/shared/gql-api-schema';

export const getStepsSessionStorageKey = (accountId: number | string) =>
	`account-onboarding-steps-cache-${accountId}`;
export type CachedOnBoardingStep = Pick<OnBoardingStep, 'name' | 'date_created'>;

export const getCachedOnBoardingSteps = (accountId: number | string) => {
	try {
		const str = sessionStorage.getItem(getStepsSessionStorageKey(accountId));

		const parsed: CachedOnBoardingStep[] = JSON.parse(str || '');

		return parsed;
	} catch {
		sessionStorage.removeItem(getStepsSessionStorageKey(accountId));

		return [];
	}
};

export const addCachedOnBoardingStep = (
	accountId: number | string,
	stepName: OnBoardingStepName,
) => {
	const data = getCachedOnBoardingSteps(accountId);

	const newCachedStep: CachedOnBoardingStep = {
		date_created: new Date().toISOString(),
		name: stepName,
	};

	data.push(newCachedStep);
	sessionStorage.setItem(getStepsSessionStorageKey(accountId), JSON.stringify(data));

	return newCachedStep;
};
