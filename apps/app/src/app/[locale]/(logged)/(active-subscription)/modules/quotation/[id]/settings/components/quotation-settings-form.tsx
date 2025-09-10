'use client';

import { CustomButton } from '@/components/custom-button';
import { FormActionsContainer } from '@/components/form-actions-container';
import { CardToggleField } from '@/components/forms/card-toggle';
import { InputField } from '@/components/forms/input';
import { Form } from '@/components/ui/form';
import { QuotationStatus } from '@/core/shared/gql-api-schema';
import { QuotationFormValues, useQuotationForm, useSetupQuotationForm } from '@/lib';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';

export const QuotationSettingsForm = () => {
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

	const t = useTranslations('quotation.settings');

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
					name="title"
					label={t('form.title')}
					skeletonMode={isDataLoading}
				/>
				<Controller
					control={methods.control}
					name="status"
					render={({ field }) => (
						<CardToggleField
							skeletonMode={isDataLoading}
							control={methods.control}
							className="bg-foreground/5 border-none"
							name="status"
							title={t('status.title')}
							description={t('status.description')}
							skipDisabledProvider
							disabled={false}
							overrideSwitchProps={{
								checked: field.value === QuotationStatus.Published,
								onCheckedChange(checked) {
									field.onChange(
										checked ? QuotationStatus.Published : QuotationStatus.Archived,
									);
								},
							}}
						/>
					)}
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
