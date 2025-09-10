'use client';

import { FormActionsContainer } from '@/components/form-actions-container';
import { Form } from '@/components/ui/form';
import {
	QuotationFormValues,
	useQuotationForm,
	useReorderQuestions,
	useSetupQuotationForm,
} from '@/lib';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { useForm, useWatch } from 'react-hook-form';
import { CustomButton } from '../../../../../../../../components/custom-button';
import { CreateNewQuestion } from './create-new-question';
import { Question } from './question';

export function ManageQuotation() {
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
	const [questions] = useWatch({
		control: methods.control,
		name: ['questions'],
	});
	const { reOrder } = useReorderQuestions(methods, 'questions');

	const t = useTranslations('quotation.edit');

	return (
		<>
			<Form {...methods}>
				<form
					onSubmit={submitForm}
					onReset={() => {
						resetFormFromData(data);
					}}>
					<DragDropContext
						onDragEnd={(e) => {
							if (e.destination) reOrder(e.source.index, e.destination?.index);
						}}>
						<div className="flex flex-col items-center gap-0">
							<Droppable droppableId={'droppable'} isDropDisabled={false}>
								{(provided) => (
									<div
										className="w-full "
										{...provided.droppableProps}
										ref={provided.innerRef}>
										{questions.map((v, k) => (
											<Draggable
												key={`questions.${k}`}
												draggableId={`questions.${k}`}
												index={k}>
												{(provided) => (
													<Question
														skeletonMode={isDataLoading}
														ref={provided.innerRef}
														dragProps={provided.draggableProps}
														dragHandlerProps={provided.dragHandleProps}
														formKey={`questions.${k}`}
														order={v.order}
														onDeleted={() => {
															const currentQuestions = methods.getValues('questions');
															if (currentQuestions.length === 1) return;

															methods.setValue(
																'questions',
																currentQuestions
																	.filter((_, i) => i !== k)
																	// reorder all
																	.map((q, i) => ({
																		...q,
																		order: i + 1,
																	})),
															);
														}}
													/>
												)}
											</Draggable>
										))}
										{provided.placeholder}
									</div>
								)}
							</Droppable>

							<CreateNewQuestion
								onClick={async () => {
									const currentQuestions = methods.getValues('questions');
									const isQuestionsValid = await methods.trigger('questions');

									// if doesnt has any questions doesnt need to check validation
									if (!currentQuestions.length || isQuestionsValid) {
										const lastQuestion = currentQuestions[currentQuestions.length - 1];
										methods.setValue(
											'questions',
											[
												...currentQuestions,
												{
													label: '',
													children: [],
													order: (lastQuestion?.order || 0) + 1,
													active: true,
												},
											],
											{
												shouldDirty: true,
												shouldTouch: true,
												shouldValidate: false,
											},
										);
									}
								}}
							/>
						</div>
					</DragDropContext>

					<FormActionsContainer>
						<CustomButton disabled={!isDirty} type="reset" variant="outline">
							{t('dismiss')}
						</CustomButton>
						<CustomButton
							disabled={!isDirty || !isValid}
							loading={isSubmitting}
							type="submit">
							{t('save')}
						</CustomButton>
					</FormActionsContainer>
				</form>
			</Form>
		</>
	);
}
