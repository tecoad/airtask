import { CustomButton } from '@/components/custom-button';
import { InputField } from '@/components/forms/input';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import {
	FlowContactSegmentFragment,
	FlowContactSegmentWithMetricsFragment,
} from '@/core/shared/gql-api-schema';
import {
	useCreateFlowContactSegment,
	useUpdateFlowContactSegment,
} from '@/lib/flow-contact-segment/hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

type Props = {
	item?: FlowContactSegmentFragment;
	isCreatingNew: boolean;
	onClose: () => void;
	onUpdate: (updatedItem: FlowContactSegmentWithMetricsFragment) => void;
	onCreate: (createdItem: FlowContactSegmentWithMetricsFragment) => void;
};

export const EditSegment = ({
	onClose,
	onUpdate,
	onCreate,
	item,
	isCreatingNew,
}: Props) => {
	const t = useTranslations('flow.segments.edit');
	const { update } = useUpdateFlowContactSegment();
	const { create } = useCreateFlowContactSegment();
	const methods = useForm<{ label: string }>({
		resolver: yupResolver(
			Yup.object({
				label: Yup.string().required(t('errors.required')),
			}),
		),
	});
	const {
		formState: { isDirty, isSubmitting },
	} = methods;

	useEffect(() => {
		methods.reset({
			label: item?.label,
		});
	}, [item, isCreatingNew]);

	return (
		<>
			<Dialog
				open={isCreatingNew || !!item}
				onOpenChange={(v) => {
					!v && onClose();
				}}>
				<DialogContent
					onInteractOutside={(e) => e.stopPropagation()}
					onCloseAutoFocus={(e) => {
						e.preventDefault();
					}}>
					<Form {...methods}>
						<form
							className="contents"
							onSubmit={methods.handleSubmit(async ({ label }) => {
								if (item) {
									onUpdate(
										await update({
											id: item.id,
											label,
										}),
									);
								} else {
									onCreate(
										await create({
											label,
										}),
									);
								}
							})}>
							<DialogHeader>
								<DialogTitle>
									{item
										? t('segment', {
												label: item.label,
										  })
										: t('createNewSegment')}
								</DialogTitle>
							</DialogHeader>

							<div className="py-3">
								<InputField control={methods.control} name="label" label={t('label')} />
							</div>
							<DialogFooter>
								<CustomButton variant="ghost" onClick={onClose}>
									{t('close')}
								</CustomButton>
								<CustomButton disabled={!isDirty} loading={isSubmitting} type="submit">
									{t('saveChanges')}
								</CustomButton>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</>
	);
};
