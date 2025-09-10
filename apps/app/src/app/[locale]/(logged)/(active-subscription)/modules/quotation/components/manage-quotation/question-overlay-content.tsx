import { QuotationFormValues, useReorderQuestions } from '@/lib';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { useId } from 'react';
import { useFormContext } from 'react-hook-form';
import { CreateNewQuestion } from './create-new-question';
import { Question } from './question';

type Props = {
	order: number;
	formKey: string;

	onForceCloseOverlay: () => void;
};

export const QuestionOverlayContent = ({
	order,
	formKey: _formKey,
	onForceCloseOverlay,
}: Props) => {
	const { watch, setValue, trigger, getValues } = useFormContext<QuotationFormValues>();
	const formKey = _formKey as `questions.${number}`;
	const data = watch(formKey);
	const childsKey = `${formKey as `questions.${number}`}.children` as const;
	const questions = watch(childsKey);
	const { reOrder } = useReorderQuestions(null, childsKey);

	return (
		<DragDropContext
			onDragEnd={(e) => {
				if (e.destination) reOrder(e.source.index, e.destination?.index);
			}}>
			<div className="flex flex-col gap-0">
				<Droppable droppableId={useId()} isDropDisabled={false}>
					{(provided) => (
						// New box drag
						<div className="w-full" {...provided.droppableProps} ref={provided.innerRef}>
							<Question
								order={order}
								isEditInOverlay
								formKey={formKey}
								onDeleted={() => {}}
							/>
							{questions?.map((v, k) => (
								<Draggable key={k.toString()} draggableId={k.toString()} index={k}>
									{(provided) => (
										<Question
											ref={provided.innerRef}
											dragProps={provided.draggableProps}
											dragHandlerProps={provided.dragHandleProps}
											key={k}
											order={v.order}
											formKey={`${formKey}.children.${k}`}
											onDeleted={() => {
												const currentQuestions = getValues(childsKey);

												if (currentQuestions.length === 1) {
													onForceCloseOverlay();
												}

												setValue(
													childsKey,
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
						const isAllChildrenValid = await trigger(childsKey);

						if (isAllChildrenValid) {
							const lastKey = `${childsKey}.${questions.length - 1}`;
							const last = getValues(lastKey as `questions.${number}`);
							setValue(childsKey, [
								...(questions || []),
								{
									label: '',
									condition: '',
									children: [],
									order: (last?.order || 0) + 1,
									active: true,
								},
							]);
						}
					}}
				/>
			</div>
		</DragDropContext>
	);
};
