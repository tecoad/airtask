'use client';
import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CustomButton } from '@/components/custom-button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import {
	ImportFlowContactsFormValues,
	useFlowContactImportForm,
	useSetupFlowContactImportForm,
} from '@/lib/flow-contact/hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import useSteps from './steps';

export type StepsProps = {
	title: string;
	description?: string;
	content: ReactNode;
	isSubmit?: boolean;
};

const ImportDialog = () => {
	const t = useTranslations('flow.contacts.importing');
	const { schema, defaultValues } = useSetupFlowContactImportForm();
	const methods = useForm<ImportFlowContactsFormValues>({
		resolver: yupResolver(schema) as any,
		defaultValues,
	});
	const { onSubmit: _onSubmit } = useFlowContactImportForm(methods);
	const onSubmit = methods.handleSubmit(_onSubmit);
	const {
		formState: { isSubmitting },
	} = methods;
	const Steps = useSteps(methods);

	const nextStep = async () => {
		const currentStep = methods.getValues('step');

		const isCurrentSubmit = Steps[currentStep].isSubmit;

		if (isCurrentSubmit) {
			await onSubmit();
			const result = methods.getValues('result');

			if (result?.__typename !== 'ImportFlowContactsQueued') {
				return;
			}
		}

		const valid = await methods.trigger(`steps.${currentStep}` as 'steps.0');
		valid && methods.setValue('step', currentStep + 1);
	};
	const prevStep = () => {
		const currentStep = methods.getValues('step');
		currentStep !== 0 && methods.setValue('step', currentStep - 1);
	};
	const [open, step] = methods.watch(['isOpen', 'step']);

	return (
		<Form {...methods}>
			<form className="contents" onSubmit={onSubmit}>
				<CustomButton
					className="h-8"
					onClick={() => {
						methods.reset(defaultValues);
						methods.setValue('isOpen', true);
					}}>
					<Download size={16} className="mr-2" />
					{t('import')}
				</CustomButton>

				<Dialog open={open} onOpenChange={(v) => methods.setValue('isOpen', v)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle className="text-foreground font-bold">
								{Steps[step].title}
							</DialogTitle>
							{Steps[step].description && (
								<DialogDescription>{Steps[step].description}</DialogDescription>
							)}
						</DialogHeader>
						<div>{Steps[step].content}</div>
						<DialogFooter>
							{step > 0 && (
								<CustomButton variant="secondary" onClick={prevStep}>
									{t('previous')}
								</CustomButton>
							)}

							{step < Steps.length - 1 ? (
								<CustomButton
									variant="default"
									loading={Steps[step].isSubmit ? isSubmitting : undefined}
									onClick={nextStep}>
									{t('next')}
								</CustomButton>
							) : (
								<CustomButton
									variant="default"
									onClick={() => methods.setValue('isOpen', false)}>
									{t('close')}
								</CustomButton>
							)}
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</form>
		</Form>
	);
};

export default ImportDialog;
