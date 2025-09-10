'use client';

import { OnBoardingStepName } from '@/core/shared/gql-api-schema';
import { Brush, Inbox, Link, Plus, Settings } from 'lucide-react';
import { ReactNode } from 'react';

import 'moment/locale/pt-br';
import { useTranslations } from 'next-intl';

import { CustomButton } from '@/components/custom-button';
import { useUser } from '@/lib';
import { useAccountSteps } from '@/lib/account/hooks';
import { Steps } from './steps';

const stepIcon: Record<OnBoardingStepName, ReactNode> = {
	[OnBoardingStepName.FinishSetupAccount]: <Settings size={16} strokeWidth={2} />,
	[OnBoardingStepName.CreateFirstQuotation]: <Plus size={16} strokeWidth={2} />,
	[OnBoardingStepName.FirstQuotationCopyLink]: <Link size={16} strokeWidth={2} />,
	[OnBoardingStepName.ReceiveFirstQuotationRequest]: <Inbox size={16} strokeWidth={2} />,
	[OnBoardingStepName.SetupWidgetSettings]: <Brush size={16} strokeWidth={2} />,
};

export const StepsByModule = () => {
	const { isUserLoading } = useUser();
	const { stepsByModule } = useAccountSteps();

	const t = useTranslations('dashboard');

	return (
		<>
			{isUserLoading && (
				<Steps module="Skeleton" steps={[]} progress={100} skeletonMode></Steps>
			)}

			{stepsByModule.map((item, key) => (
				<Steps
					module={item.title}
					key={key}
					steps={item.steps.map((step) => ({
						title: step.title,
						description: step.executed
							? t('onboardingSteps.finishedAt', {
									date: new Date(step.executedAt!).toLocaleDateString(),
									time: new Date(step.executedAt!).toLocaleTimeString(),
							  })
							: step.execDescription,
						completed: step.executed,
						actionContent: !step.executed && step.neededAction && (
							<CustomButton
								onClick={step.neededAction}
								className="whitespace-nowrap rounded-full"
								size="sm">
								{t('onboardingSteps.finishNow')}
							</CustomButton>
						),
						icon: stepIcon[step.name],
					}))}
					progress={item.percentOfStepsExecuted}
				/>
			))}
		</>
	);
};
