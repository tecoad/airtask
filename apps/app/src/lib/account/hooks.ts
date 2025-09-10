'use client';

import { AccountUsageKind, OnBoardingStepName } from '@/core/shared/gql-api-schema';
import { useUser } from '@/lib/user';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	CachedOnBoardingStep,
	addCachedOnBoardingStep,
	getCachedOnBoardingSteps,
} from './helpers';

export const useCachedAccountSteps = () => {
	const { accountSelected } = useUser();
	const accountId = accountSelected?.account.id;
	const [cachedSteps, setCachedSteps] = useState<CachedOnBoardingStep[]>([]);

	useEffect(() => {
		if (!accountId) return;

		setCachedSteps(getCachedOnBoardingSteps(accountId));
	}, [accountId]);

	const ensureAccountStepIsConcluded = (stepName: OnBoardingStepName) => {
		if (!accountId) return;

		const cachedSteps = getCachedOnBoardingSteps(accountId);

		if (cachedSteps.find((item) => item.name === stepName)) {
			return;
		}

		addCachedOnBoardingStep(accountId, stepName);

		setCachedSteps(getCachedOnBoardingSteps(accountId));
	};

	return { ensureAccountStepIsConcluded, cachedSteps };
};

export type OnBoardingStepsUIListItem = {
	module: AccountUsageKind;
	title: string;
	steps: {
		name: OnBoardingStepName;
		title: string;
		execDescription: string;
		neededAction?: () => void;
		executed: boolean;
		executedAt?: string;
	}[];
	percentOfStepsExecuted: number;
};

export const useAccountSteps = () => {
	const { accountSelected, isAccountAllowedToModule } = useUser();
	const { cachedSteps } = useCachedAccountSteps();
	const router = useRouter();

	const t = useTranslations('dashboard.onboardingSteps');

	const findUserStep = useCallback(
		(step: OnBoardingStepName) => {
			return [
				...(accountSelected?.account.concluded_onboarding_steps || []),
				...cachedSteps,
			].find((v) => v.name === step);
		},
		[accountSelected?.account.concluded_onboarding_steps, cachedSteps],
	);

	const stepsByModule = useMemo<OnBoardingStepsUIListItem[]>(() => {
		const allStepsByModule: Omit<OnBoardingStepsUIListItem, 'percentOfStepsExecuted'>[] =
			[
				{
					module: AccountUsageKind.Quotation,
					title: t('quotation.title'),
					steps: [
						{
							name: OnBoardingStepName.CreateFirstQuotation,
							title: t('quotation.create_first_quotation.title'),
							execDescription: t('quotation.create_first_quotation.execDescription'),
							executed: !!findUserStep(OnBoardingStepName.CreateFirstQuotation),
							executedAt: findUserStep(OnBoardingStepName.CreateFirstQuotation)
								?.date_created,
							neededAction: () => {
								router.push('/modules');
							},
						},
						{
							name: OnBoardingStepName.FirstQuotationCopyLink,
							title: t('quotation.first_quotation_copy_link.title'),
							execDescription: t('quotation.first_quotation_copy_link.execDescription'),
							executed: !!findUserStep(OnBoardingStepName.FirstQuotationCopyLink),
							executedAt: findUserStep(OnBoardingStepName.FirstQuotationCopyLink)
								?.date_created,
							neededAction: () => {
								router.push('/modules');
							},
						},
						{
							name: OnBoardingStepName.ReceiveFirstQuotationRequest,

							title: t('quotation.receive_first_quotation_request.title'),
							execDescription: t(
								'quotation.receive_first_quotation_request.execDescription',
							),
							executed: !!findUserStep(OnBoardingStepName.ReceiveFirstQuotationRequest),
							executedAt: findUserStep(OnBoardingStepName.ReceiveFirstQuotationRequest)
								?.date_created,
						},
						{
							name: OnBoardingStepName.SetupWidgetSettings,
							title: t('quotation.setup_widget_settings.title'),
							execDescription: t('quotation.setup_widget_settings.execDescription'),
							executed: !!findUserStep(OnBoardingStepName.SetupWidgetSettings),
							executedAt: findUserStep(OnBoardingStepName.SetupWidgetSettings)
								?.date_created,
							neededAction: () => {
								router.push('/settings/widget');
							},
						},
					],
				},
			];

		return allStepsByModule
			.filter((step) => isAccountAllowedToModule(step.module))
			.map((v) => {
				const firstStepNotExecuted = v.steps.find((step) => !step.executed);

				return {
					...v,
					percentOfStepsExecuted:
						(v.steps.filter((step) => step.executed).length / v.steps.length) * 100,
					steps: v.steps.map((step) => {
						return {
							...step,
							// Only the first step not executed will have a needed action
							neededAction:
								firstStepNotExecuted?.name === step.name ? step.neededAction : undefined,
						};
					}),
				};
			});
	}, [findUserStep, t, isAccountAllowedToModule]);

	return { stepsByModule };
};
