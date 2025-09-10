import { CustomButton } from '@/components/custom-button';
import { Switch } from '@/components/ui/switch';
import { WithConfirmAction } from '@/components/with-confirm-action';
import { useBoolean } from '@/core/hooks/useBoolean';
import { QuotationFormValues, useDeleteQuestion } from '@/lib';
import { recursiveGroupQuestionChildren } from '@/lib/quotation/helpers';
import {
	DraggableProvidedDragHandleProps,
	DraggableProvidedDraggableProps,
} from '@hello-pangea/dnd';
import { AlertCircle, Grip, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { forwardRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '../../../../../../../../components/ui/tooltip';
import { Overlay } from './overlay';
import { QuestionOverlayContent } from './question-overlay-content';
import { Inputs } from './question/inputs';
import { Number } from './question/number';

interface Props {
	order: number;

	isEditInOverlay?: boolean;

	formKey: string;

	onDeleted: () => void;

	dragProps?: DraggableProvidedDraggableProps;
	dragHandlerProps?: DraggableProvidedDragHandleProps | null;

	skeletonMode?: boolean;
}

export const Question = forwardRef<any, Props>((props, ref) => {
	const {
		order,
		isEditInOverlay,
		formKey: _formKey,
		onDeleted,
		dragProps,
		dragHandlerProps,
		skeletonMode,
	} = props;
	const t = useTranslations('quotation.edit');
	// will control the overlay config
	const [isConfigOpen, { off, toggle }] = useBoolean();
	const { getValues, watch, trigger, control } = useFormContext<QuotationFormValues>();

	const formKey = _formKey as `questions.${number}`;
	const data = watch(formKey);
	const isChild =
		'condition' in data && typeof data.condition === 'string' && !isEditInOverlay;

	const questionChilds = watch(`${formKey}.children`);
	const questionsBellow = recursiveGroupQuestionChildren(questionChilds);

	const { exec, isLoading } = useDeleteQuestion();

	const onDelete = async () => {
		const value = getValues(formKey);
		// value is created at backend, need to delete it
		if (value.id) {
			await exec(value.id);
		}

		onDeleted();
	};

	return (
		<>
			<Overlay
				title={t('title', { question: data.label })}
				isOpen={isConfigOpen}
				onClose={async () => {
					// should validate the questions childs before closing the overlay
					const childsKey = `${formKey}.children` as const;
					const isValid = await trigger(childsKey);
					isValid && off();
				}}>
				<QuestionOverlayContent
					order={order}
					formKey={formKey}
					onForceCloseOverlay={off}
				/>
			</Overlay>
			<div className="pb-6" ref={ref} {...dragProps}>
				<div className={`card-gradient ${skeletonMode ? 'animate-pulse' : ''}`}>
					{isChild && <div className="w-[10px] md:w-[30px]" />}

					<div className="flex w-full flex-col items-stretch gap-4 overflow-hidden p-4 pt-7">
						<div className="flex flex-grow flex-row gap-3">
							<Number skeletonMode={skeletonMode} number={order} />
							<Inputs
								isChild={isChild}
								formKey={formKey}
								skeletonMode={skeletonMode}
								isEditInOverlay={isEditInOverlay}
								onChildsToggle={toggle}
							/>
						</div>

						<div className="flex flex-row items-center justify-between gap-3">
							<div>
								<Controller
									name={`${formKey}.label`}
									control={control}
									render={({ fieldState }) => (
										<>
											{fieldState.error?.message && (
												<div className="flex gap-3">
													<div className="w-8"></div>
													<TooltipProvider>
														<Tooltip defaultOpen>
															<TooltipTrigger className="flex h-8 w-8 items-center ">
																<CustomButton
																	size="icon"
																	variant="destructive"
																	className="ring-destructive/40 h-6 w-6 cursor-pointer rounded-full ring-4">
																	<AlertCircle size={16} />
																</CustomButton>
															</TooltipTrigger>
															<TooltipContent side="right" className="border-none">
																{fieldState.error?.message}
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</div>
											)}
										</>
									)}
								/>
							</div>

							<div className="flex flex-row items-center gap-3">
								{!isEditInOverlay && (
									<>
										{!skeletonMode && (
											<Controller
												name={`${formKey}.active`}
												control={control}
												render={({ field: { value, onChange, ...fieldRest } }) => (
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<div className="flex items-center ">
																	<Switch
																		{...fieldRest}
																		onCheckedChange={onChange}
																		checked={value}
																	/>
																</div>
															</TooltipTrigger>
															<TooltipContent side="left">
																{value ? t('enabled') : t('disabled')}
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												)}
											/>
										)}

										{/* at top level, is must be impossible to delete the only one question left */}
										{!isChild && watch('questions').length === 1 ? (
											<></>
										) : (
											<WithConfirmAction
												title={t('confirm')}
												isAlert
												description={t('confirmHasChild', {
													questionsNumber: questionsBellow.length,
												})}
												onConfirm={onDelete}
												isActive={questionsBellow.length > 0}>
												<CustomButton
													onClick={onDelete}
													size="icon"
													variant="outline"
													loading={!questionsBellow.length && isLoading}
													className={`h-8 w-8 rounded-full ${
														skeletonMode ? 'bg-foreground/20  text-transparent' : ''
													}`}>
													<Trash size={16} />
												</CustomButton>
											</WithConfirmAction>
										)}

										<CustomButton
											size="icon"
											variant="secondary"
											className={`h-8 w-8 cursor-grab rounded-full transition-transform hover:scale-125  ${
												skeletonMode ? 'bg-foreground/20 text-transparent' : ''
											}`}
											{...dragHandlerProps}>
											<Grip size={16} />
										</CustomButton>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
});
