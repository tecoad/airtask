import { CustomButton } from '@/components/custom-button';
import { InputField } from '@/components/forms/input';
import { MultiSelectField } from '@/components/forms/multiselect-field';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import {
	CreateKnowledgeBaseQaInput,
	KnowledgeBaseFragment,
	KnowledgeBaseQaFragment,
} from '@/core/shared/gql-api-schema';
import {
	useCreateKnowledgeBaseQa,
	useUpdateKnowledgeBaseQa,
} from '@/lib/knowledge/hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	item?: KnowledgeBaseQaFragment;

	knowledgeBases: KnowledgeBaseFragment[];
	isKnowledgeBaseLoading: boolean;

	onEdit?: (item: KnowledgeBaseQaFragment) => Promise<void> | void;
	onCreate?: (item: KnowledgeBaseQaFragment) => Promise<void> | void;
};

type FormValues = {
	answer: string;
	question: string;
	knowledge_base: string[];
};

const EditOrCreateQuestion = ({
	isOpen,
	isKnowledgeBaseLoading,
	knowledgeBases,
	item,
	onCreate,
	onEdit,
	onClose,
}: Props) => {
	const t = useTranslations('flow.knowledge.create');
	const params = useParams();

	const methods = useForm<FormValues>({
		resolver: yupResolver(
			Yup.object({
				answer: Yup.string().required(t('errors.required')),
				question: Yup.string().required(t('errors.required')),
				knowledge_base: Yup.array(Yup.string()).test(
					'is-valid',
					t('minLength'),
					(v) => v && v.length > 0,
				),
			}) as any,
		),
	});
	const {
		formState: { isSubmitting, isDirty, errors, submitCount },
	} = methods;
	const isEdit = !!item;
	const { create } = useCreateKnowledgeBaseQa();
	const { update } = useUpdateKnowledgeBaseQa();

	const itemToDefaultValues = (input: typeof item): FormValues =>
		input
			? {
					answer: input.answer,
					question: input.question,
					knowledge_base: input.knowledge_base.map((v) => v.id),
			  }
			: {
					answer: '',
					question: '',
					knowledge_base: [params.id as string],
			  };

	useEffect(() => {
		methods.reset(itemToDefaultValues(item));
	}, [item?.id, isEdit]);

	const bases = methods.watch('knowledge_base');
	useEffect(() => {
		if (!bases?.length) {
			methods.setValue('knowledge_base', [params.id as string]);
		}
	}, [bases]);

	return (
		<Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
			<DialogContent>
				<Form {...methods}>
					<form
						className="contents"
						onSubmit={methods.handleSubmit(async (values) => {
							console.log(values);
							const sharedInput = {
								answer: values.answer,
								question: values.question,
								knowledge_base_id: values.knowledge_base,
							} satisfies CreateKnowledgeBaseQaInput;

							let result: KnowledgeBaseQaFragment;
							if (isEdit) {
								result = await update({
									id: item.id,
									...sharedInput,
								});
								onEdit?.(result);
							} else {
								[result] = await create(sharedInput);
								onCreate?.(result);
							}

							methods.reset(itemToDefaultValues(undefined));
						})}>
						<DialogHeader>
							<DialogTitle>
								{isEdit ? t('editQuestion') : t('createQuestion')}
							</DialogTitle>
						</DialogHeader>

						<InputField
							name="question"
							label={t('questionLabel')}
							placeholder={t('questionPlaceholder')}
							asTextArea
							control={methods.control}
						/>

						<InputField
							name="answer"
							label={t('answerLabel')}
							placeholder={t('answerPlaceholder')}
							asTextArea
							control={methods.control}
						/>

						{isEdit && (
							<MultiSelectField
								label={t('knowledgeBasesLabel')}
								name="knowledge_base"
								placeholder={t('knowledgeBasesPlaceholder')}
								options={knowledgeBases.map((v) => ({
									label: v.title,
									value: v.id,
								}))}
								control={methods.control}
								skeletonMode={isKnowledgeBaseLoading}
								description={t('knowledgeBasesDescription')}
							/>
						)}

						<DialogFooter className="flex flex-row gap-2 ">
							<CustomButton variant="outline" className="flex-grow">
								{t('close')}
							</CustomButton>
							<CustomButton
								type="submit"
								className="flex-grow"
								loading={isSubmitting}
								disabled={!isDirty}>
								{t('saveChanges')}
							</CustomButton>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default EditOrCreateQuestion;
