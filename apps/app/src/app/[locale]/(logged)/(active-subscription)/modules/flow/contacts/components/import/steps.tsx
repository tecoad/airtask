import { CustomButton } from '@/components/custom-button';
import { Dropzone } from '@/components/dropzone';
import { PopoverSelectField } from '@/components/forms/popover-select';
import { useCounter } from '@/core/hooks/useCounter';
import {
	ImportFlowContactsErrorCode,
	ImportFlowContactsQueued,
} from '@/core/shared/gql-api-schema';
import { useListFlowContactSegments } from '@/lib/flow-contact-segment/hooks';
import { ImportFlowContactsFormValues } from '@/lib/flow-contact/hooks';
import { XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Controller, UseFormReturn, useFormContext } from 'react-hook-form';
import { StepsProps } from './dialog';

const useSteps = (methods: UseFormReturn<ImportFlowContactsFormValues>) => {
	const t = useTranslations('flow.contacts.importing');
	const { data, isLoading } = useListFlowContactSegments();

	const Steps: StepsProps[] = [
		{
			title: t('selectSegment.title'),
			description: t('selectSegment.description'),
			content: (
				<PopoverSelectField
					skeletonMode={isLoading}
					label={t('selectSegment.label')}
					items={(data || []).map((v) => ({
						label: v.label,
						value: v.id,
					}))}
					control={methods.control}
					name="steps.0.segment_id"
				/>
			),
		},
		{
			title: t('selectAFileToUpload'),
			content: <SelectFile />,
			isSubmit: true,
		},
		{
			title: t('processingImport'),
			content: <ProcessingImport />,
		},
	];

	return Steps;
};

const SelectFile = () => {
	const { control, watch, setValue } = useFormContext<ImportFlowContactsFormValues>();
	const t = useTranslations('flow.contacts.importing');

	const result = watch('result');
	const errorMessage = useMemo(() => {
		switch (result?.__typename) {
			case 'ImportFlowContactsError':
				switch (result.errorCode) {
					case ImportFlowContactsErrorCode.InvalidCsvColumnsStructure:
						return t('errors.invalidCsvColumnsStructure', {
							invalidColumns: result.message,
						});
					case ImportFlowContactsErrorCode.InvalidFileFormat:
						return t('errors.invalidFileFormat');
					case ImportFlowContactsErrorCode.NoItemsFound:
						return t('errors.noItemsFound');
				}
				break;
		}
	}, [result, t]);

	return (
		<Controller
			control={control}
			name="steps.1.file"
			render={({ field, fieldState }) => (
				<>
					{errorMessage && <p>{errorMessage}</p>}

					{field.value && (
						<div className="flex items-center justify-center gap-2">
							<XCircle
								className="text-foreground cursor-pointer"
								onClick={() => {
									field.onChange(undefined);
									setValue('result', undefined);
								}}
							/>
							<p>{field.value.name}</p>
						</div>
					)}
					{!field.value && (
						<>
							<Dropzone
								onCustomOnDrop={([file]) => {
									field.onChange(file);
								}}
								dropzoneSettings={{
									maxFiles: 1,
									accept: {
										'text/csv': ['.csv'],
									},
								}}
							/>
							<CustomButton>
								<a type="download" href="/assets/import-flow-contacts-example.csv">
									{t('downloadFileExample')}
								</a>
							</CustomButton>
						</>
					)}
				</>
			)}
		/>
	);
};

const ProcessingImport = () => {
	const t = useTranslations('flow.contacts.importing');

	const { setValue, watch } = useFormContext<ImportFlowContactsFormValues>();
	const result = watch('result');

	const value = useCounter({
		initialValue: 15,
		mode: 'decrease',
		goalValue: 0,
		onGoalValue() {
			setValue('isOpen', false);
		},
	});

	return (
		<>
			<p>
				{t('processingFile', {
					contacts: (result as ImportFlowContactsQueued).queued_items,
				})}
			</p>

			<p>{t('emailNotification')}</p>
			<br />
			<p> {t('windowClosingAt', { secondsLeft: value })}</p>
		</>
	);
};

export default useSteps;
