'use client';

import { CustomButton } from '@/components/custom-button';
import { FormActionsContainer } from '@/components/form-actions-container';
import { CardToggleField } from '@/components/forms/card-toggle';
import { Form } from '@/components/ui/form';
import {
	WidgetSettingsFormMode,
	WidgetSettingsFormValues,
	useSetupWidgetSettingsForm,
	useWidgetSettingsForm,
} from '@/lib/settings';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { ButtonSection } from './button-section';
import { PreviewWidget } from './preview-widget';
import { WindowSection } from './window-section';

type Props = {
	fontsNameList: string[];
	/**
	 * if quotationId is defined, widgetForm will assume quotation edit mode with global settings toggle
	 */
	mode?: WidgetSettingsFormMode;
};

export function WidgetForm({ fontsNameList, mode = 'account_settings' }: Props) {
	const t = useTranslations('settings.widget');
	const { defaultValues, schema } = useSetupWidgetSettingsForm();
	const methods = useForm<WidgetSettingsFormValues>({
		defaultValues,
		resolver: yupResolver(schema as any),
	});
	const {
		formState: { isDirty, isSubmitting },
	} = methods;
	const { onSubmit, isDataLoading, resetFormFromData, data, isDefaultSettingsAOption } =
		useWidgetSettingsForm(methods, mode);

	const isUsingDefaultSettings =
		isDefaultSettingsAOption && methods.watch('use_default_settings');

	return (
		<Form {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				{isDefaultSettingsAOption && (
					<CardToggleField
						control={methods.control}
						className="bg-foreground/5 border-none"
						name="use_default_settings"
						title={t('globalSettings.title')}
						description={t('globalSettings.description')}
						skipDisabledProvider
						disabled={isDataLoading}
						// skeletonMode={isDataLoading}
					/>
				)}

				<div
					className={`space-y-4  ${
						isUsingDefaultSettings ? 'pointer-events-none opacity-20' : ''
					}`}>
					<WindowSection fontsNameList={fontsNameList} skeletonMode={isDataLoading} />

					<ButtonSection skeletonMode={isDataLoading} />
				</div>

				<FormActionsContainer>
					<PreviewWidget />

					<div className="flex-grow" />
					<CustomButton
						variant="secondary"
						className="hidden md:block"
						disabled={!isDirty}
						onClick={() => {
							resetFormFromData(data);
						}}>
						{t('dismiss')}
					</CustomButton>
					<CustomButton loading={isSubmitting} disabled={!isDirty} type="submit">
						{t('updateSettings')}
					</CustomButton>
				</FormActionsContainer>
			</form>
		</Form>
	);
}
