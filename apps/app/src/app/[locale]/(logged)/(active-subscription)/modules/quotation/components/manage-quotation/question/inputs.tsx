import { Badge } from '@/components/ui/badge';
import { QuotationFormValues } from '@/lib';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';
import { InputTrigger } from '../input-trigger';

interface Props {
	isChild?: boolean;
	formKey: string;
	isEditInOverlay?: boolean;
	onChildsToggle: () => void;
	skeletonMode?: boolean;
}

export const Inputs = ({
	isChild,
	formKey: _formKey,
	isEditInOverlay,
	onChildsToggle,
	skeletonMode,
}: Props) => {
	const { control, watch } = useFormContext<QuotationFormValues>();
	const formKey = _formKey as `questions.${number}`;
	const data = watch(formKey);
	const t = useTranslations('quotation.edit');

	return (
		<div className="flex w-full flex-col items-stretch p-0">
			{isChild && (
				<div className="align w-full flex-col items-start lg:flex-row lg:items-center">
					<div className="pointer-events-none flex flex-col items-center gap-2">
						<Badge className="z-10 -mb-3 h-6">{t('ifAnswerIs')}</Badge>
					</div>

					<Controller
						control={control}
						name={`${formKey}.condition`}
						render={({ field, fieldState }) => (
							<InputTrigger
								data={field.value}
								type="condition"
								placeholder={t('addConditionPlaceholder')}
								onDataChange={field.onChange}
								errorMessage={fieldState.error?.message}
							/>
						)}
					/>

					<div className="pointer-events-none mt-4 flex flex-col items-center">
						<Badge className="z-10 -mb-3 h-6">{t('ask')}</Badge>
					</div>
				</div>
			)}

			<div className="items-star flex w-full flex-col">
				<Controller
					control={control}
					name={`${formKey}.label`}
					render={({ field, fieldState }) => (
						<InputTrigger
							isEditInOverlay={isEditInOverlay}
							type="question"
							data={field.value}
							skeletonMode={skeletonMode}
							numChilds={data?.children?.length}
							onChildsToggle={onChildsToggle}
							onDataChange={field.onChange}
							errorMessage={fieldState.error?.message}
						/>
					)}
				/>
			</div>
		</div>
	);
};
