'use client';

import { CustomButton } from '@/components/custom-button';
import { InputField } from '@/components/forms/input';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { WithConfirmAction } from '@/components/with-confirm-action';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { Separator } from './ui/separator';

type DeletionCardProps = {
	onSubmit: () => void;
	isValid: boolean;
	methods: ReturnType<typeof useForm>;
	title: string;
	type: string;
};

export const DeletionCard = ({
	onSubmit,
	isValid,
	methods,
	title,
	type,
}: DeletionCardProps) => {
	const t = useTranslations('ui.deletionCard');

	return (
		<Card className="flex flex-col gap-0 overflow-hidden">
			<div className="flex flex-col gap-3 p-5">
				<div className="text-destructive text-lg font-semibold">{t('delete.title')}</div>
				<div>{t('delete.description')}</div>
			</div>
			<Separator />
			<div className="mt-0 flex flex-row justify-end  p-5">
				<WithConfirmAction
					title={t('delete.confirm.title')}
					isActive
					description={t('delete.confirm.cantUndo')}
					onConfirm={onSubmit}
					confirmLabel={t('delete.button')}
					autoCloseOnConfirm={false}
					isConfirmDisabled={!isValid}
					content={
						<Form {...methods}>
							<form onSubmit={onSubmit}>
								<div className="grid gap-4 py-4">
									<InputField
										control={methods.control}
										name="instanceName"
										label={t('delete.confirm.ask', { title: title, type: type })}
									/>
								</div>
							</form>
						</Form>
					}>
					<CustomButton variant="destructive">{t('delete.button')}</CustomButton>
				</WithConfirmAction>
			</div>
		</Card>
	);
};
