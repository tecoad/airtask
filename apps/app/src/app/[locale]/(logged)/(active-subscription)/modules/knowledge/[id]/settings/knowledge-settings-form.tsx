'use client';

import { CustomButton } from '@/components/custom-button';
import { FormActionsContainer } from '@/components/form-actions-container';
import { InputField } from '@/components/forms/input';
import { Form } from '@/components/ui/form';
import { KnowledgeBaseFragment } from '@/core/shared/gql-api-schema';
import { useUpdateKnowledgeBase } from '@/lib/knowledge/hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

export const KnowledgeSettingsFormContent = ({
	knowledgeBase,
}: {
	knowledgeBase: KnowledgeBaseFragment;
}) => {
	const t = useTranslations('flow.knowledge.edit');
	const { update } = useUpdateKnowledgeBase();
	const defaultValues = {
		title: knowledgeBase.title,
	};
	const methods = useForm<{ title: string }>({
		defaultValues,
		resolver: yupResolver(
			Yup.object({
				title: Yup.string().required(t('errors.required')),
			}) as any,
		),
	});
	const {
		formState: { isDirty, isSubmitting, errors, isValid },
	} = methods;

	return (
		<Form {...methods}>
			<form
				className="space-y-8"
				onSubmit={methods.handleSubmit(async ({ title }) => {
					await update({
						id: knowledgeBase.id,
						title,
					});
				})}
				onReset={() => {
					methods.reset(defaultValues);
				}}>
				<InputField control={methods.control} name="title" label={t('form.title')} />

				<FormActionsContainer>
					<CustomButton disabled={!isDirty} type="reset" variant="outline">
						{t('form.reset')}
					</CustomButton>
					<CustomButton disabled={!isDirty} loading={isSubmitting} type="submit">
						{t('form.save')}
					</CustomButton>
				</FormActionsContainer>
			</form>
		</Form>
	);
};
