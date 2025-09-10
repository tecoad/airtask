import { CardRadioField } from '@/components/forms/card-radio-v2';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { AgentCreateUseCase, UserChoicesContext } from './machine';
import { StepHandleProps } from './types';

const UseCase = (props: StepHandleProps) => {
	const t = useTranslations('flow.agents.create.useCase');
	const { control } = useFormContext<UserChoicesContext>();

	return (
		<div>
			<CardRadioField
				{...props}
				control={control}
				name="useCase"
				title={t('title')}
				items={[
					{
						label: t('sales'),
						value: AgentCreateUseCase.Sales,
					},
					{
						label: t('customerService'),
						value: AgentCreateUseCase.CustomerService,
					},
					{
						label: t('other'),
						value: AgentCreateUseCase.Other,
					},
				]}
			/>
		</div>
	);
};

export default UseCase;
