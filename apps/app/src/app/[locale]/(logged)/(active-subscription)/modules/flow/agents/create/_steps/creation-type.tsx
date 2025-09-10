import { CardRadioField } from '@/components/forms/card-radio-v2';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { AgentCreationType, UserChoicesContext } from './machine';
import { StepHandleProps } from './types';

const CreationType = (props: StepHandleProps) => {
	const t = useTranslations('flow.agents.create.creationType');
	const { control } = useFormContext<UserChoicesContext>();

	return (
		<div>
			<CardRadioField
				{...props}
				title={t('title')}
				control={control}
				name="creationType"
				description={t('description')}
				items={[
					{
						label: t('usingAI.title'),
						description: t('usingAI.description'),
						value: AgentCreationType.AI,
					},
					{
						label: t('scratch.title'),
						description: t('scratch.description'),
						value: AgentCreationType.Scratch,
					},
				]}
			/>
		</div>
	);
};

export default CreationType;
