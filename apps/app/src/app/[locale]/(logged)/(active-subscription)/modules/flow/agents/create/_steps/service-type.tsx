import { CardRadioField } from '@/components/forms/card-radio-v2';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { AgentCreateServiceType, UserChoicesContext } from './machine';
import { StepHandleProps } from './types';

const ServiceType = (props: StepHandleProps) => {
	const t = useTranslations('flow.agents.create.serviceType');
	const { control } = useFormContext<UserChoicesContext>();

	return (
		<div>
			<CardRadioField
				{...props}
				title={t('title')}
				control={control}
				name="serviceType"
				description={t('description')}
				items={[
					{
						label: t('general.title'),
						description: t('general.description'),
						value: AgentCreateServiceType.General,
					},
					{
						label: t('objective.title'),
						description: t('objective.description'),
						value: AgentCreateServiceType.Objective,
					},
				]}
			/>
		</div>
	);
};

export default ServiceType;
