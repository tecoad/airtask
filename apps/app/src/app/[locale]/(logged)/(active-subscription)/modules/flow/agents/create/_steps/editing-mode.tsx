import { CardRadioField } from '@/components/forms/card-radio-v2';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { AgentCreateEditingMode, UserChoicesContext } from './machine';
import { StepHandleProps } from './types';

const EditingMode = (props: StepHandleProps) => {
	const t = useTranslations('flow.agents.create.editingMode');
	const { control } = useFormContext<UserChoicesContext>();

	return (
		<div>
			<CardRadioField
				{...props}
				control={control}
				name="editingMode"
				title={t('title')}
				items={[
					{
						label: t('standard.title'),
						description: t('standard.description'),
						value: AgentCreateEditingMode.Standard,
					},
					{
						label: t('advanced.title'),
						value: AgentCreateEditingMode.Advanced,
						description: t('advanced.description'),
					},
				]}
			/>
		</div>
	);
};

export default EditingMode;
