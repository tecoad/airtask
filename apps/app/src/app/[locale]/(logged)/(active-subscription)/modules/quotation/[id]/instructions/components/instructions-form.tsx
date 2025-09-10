'use client';

import { CustomButton } from '@/components/custom-button';
import { FormActionsContainer } from '@/components/form-actions-container';
import { InputField } from '@/components/forms/input';
import { Form } from '@/components/ui/form';
import { QuotationFormValues, useQuotationForm, useSetupQuotationForm } from '@/lib';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

export const InstructionsForm = () => {
	const { defaultValues, schema } = useSetupQuotationForm();
	const methods = useForm<QuotationFormValues>({
		defaultValues,
		resolver: yupResolver(schema as any),
		mode: 'all',
	});
	const {
		formState: { isDirty, isSubmitting, errors, isValid },
	} = methods;
	const { onSubmit, isDataLoading, isEdit, data, resetFormFromData } =
		useQuotationForm(methods);
	// const { modelQuotation } = useQuotationFromModel();
	const submitForm = methods.handleSubmit(onSubmit);

	const t = useTranslations('quotation.instructions');

	return (
		<Form {...methods}>
			<form
				className="space-y-8"
				onSubmit={submitForm}
				onReset={() => {
					resetFormFromData(data);
				}}>
				<InputField
					control={methods.control}
					name="promptInstructions"
					label={t('form.about.title')}
					description={
						<>
							<div>{t('form.about.description')}</div>
							<div className="flex flex-wrap items-center gap-2">
								{t('form.about.howTo')}

								{/* <CustomButton variant="outline" className="flex h-7 gap-1 px-2">
									{t('form.about.generateByIA')}
									<Sparkles size={18} strokeWidth={2} />
								</CustomButton> */}
							</div>
						</>
					}
					asTextArea
					skeletonMode={isDataLoading}
				/>

				<FormActionsContainer>
					<CustomButton disabled={!isDirty} type="reset" variant="outline">
						{t('form.reset')}
					</CustomButton>
					<CustomButton
						disabled={!isDirty || !isValid}
						loading={isSubmitting}
						type="submit">
						{t('form.save')}
					</CustomButton>
				</FormActionsContainer>
			</form>
		</Form>
	);
};
