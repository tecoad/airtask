import { apiClient } from '@/core/services/graphql';
import {
	CreateQuotationMutation,
	CreateQuotationMutationVariables,
	CreateQuotationQuestionChildrenInput,
	CreateQuotationQuestionInput,
	CreateQuotationQuestionMutation,
	CreateQuotationQuestionMutationVariables,
	QuotationFragment,
	UpdateQuotationMutation,
	UpdateQuotationMutationVariables,
	UpdateQuotationQuestionMutation,
	UpdateQuotationQuestionMutationVariables,
} from '@/core/shared/gql-api-schema';
import {
	CREATE_QUOTATION,
	CREATE_QUOTATION_QUESTION,
	UPDATE_QUOTATION,
	UPDATE_QUOTATION_QUESTION,
} from './api-gql';
import { recursiveGroupQuestionChildren } from './helpers';
import { QuestionForm, QuotationFormValues } from './hooks';

export const updateQuotation = async (
	values: QuotationFormValues,
	data: QuotationFragment,
) => {
	const mapChildren = (
		children: QuestionForm[],
	): CreateQuotationQuestionChildrenInput[] => {
		return children.map((v, k) => ({
			label: v.label,
			order: k,
			condition: v.condition!,
			children: mapChildren(v.children),
		}));
	};

	const mapQuestionToCreateInput: (
		v: QuestionForm,
		k: number,
	) => CreateQuotationQuestionInput = (v, k) => {
		return {
			label: v.label,
			order: k + 1,
			quotation: values.id!,
			condition: v.condition!,
			children: mapChildren(v.children),
			parent: v.parentId,
			active: v.active,
		};
	};

	// Here we check if there is any new question, if so, we create it first
	// and update the id of the question in the array
	const checkNewQuestion = async (
		question: QuestionForm,
		questionIndex: number,
		parentId?: string,
	) => {
		let createdId: string | undefined = undefined;

		if (!question.id) {
			const res = await apiClient.mutate<
				CreateQuotationQuestionMutation,
				CreateQuotationQuestionMutationVariables
			>({
				mutation: CREATE_QUOTATION_QUESTION,
				variables: {
					input: [
						mapQuestionToCreateInput(
							{
								...question,
								parentId,
							},
							questionIndex,
						),
					],
				},
			});

			if (parentId) {
				question.parentId = parentId;
			}

			createdId = res.data!.createQuotationQuestion[0].id;
			question.id = createdId;

			return question;
		}

		for (const childKey in question.children) {
			const childIndex = Number(childKey);
			const child = question.children[childIndex];
			await checkNewQuestion(child, childIndex, question.id || createdId);
		}
	};

	for (const questionKey in values.questions) {
		const questionIndex = Number(questionKey);
		const question = values.questions[questionIndex];
		await checkNewQuestion(question, questionIndex);
	}

	// Here, after getting the ID of all, we group at the same level
	// with parent id and then update the questions that are modified
	const questionsGroup = recursiveGroupQuestionChildren(values.questions);

	// Delete is made at the time users click on form, not on submit, so we just need to check here for updated questions
	const updatedQuestions = questionsGroup.filter((v) => {
		const atDb = data?.questions?.find((q) => q.id === v.id);

		if (!atDb) {
			// If there is no question at db, it means it is a new question
			return false;
		}

		const isModified =
			atDb.label !== v.label ||
			atDb.condition !== v.condition ||
			atDb.order !== v.order ||
			atDb.active !== v.active;

		return isModified;
	});

	for (const question of updatedQuestions!) {
		await apiClient.mutate<
			UpdateQuotationQuestionMutation,
			UpdateQuotationQuestionMutationVariables
		>({
			mutation: UPDATE_QUOTATION_QUESTION,
			variables: {
				input: {
					id: question.id!,
					condition: question.condition!,
					label: question.label!,
					order: question.order!,
					parent: question.parentId!,
					active: question.active,
				},
			},
		});
	}

	// Update quotation after questions because at this query
	// it will fetch questions again and updated to be able to refresh on the interface
	const result = await apiClient.mutate<
		UpdateQuotationMutation,
		UpdateQuotationMutationVariables
	>({
		mutation: UPDATE_QUOTATION,
		variables: {
			input: {
				id: values.id!,
				prompt_instructions: values.promptInstructions,
				status: values.status,
				title: values.title,
			},
		},
	});

	return result.data?.updateQuotation!;
};

export const createQuotation = async (values: QuotationFormValues, accountId: string) => {
	const res = await apiClient.mutate<
		CreateQuotationMutation,
		CreateQuotationMutationVariables
	>({
		mutation: CREATE_QUOTATION,
		variables: {
			input: {
				account: accountId,
				title: values.title,
				prompt_instructions: values.promptInstructions,
				status: values.status,
			},
		},
	});

	const mapChildren = (
		children: QuestionForm[],
	): CreateQuotationQuestionChildrenInput[] => {
		return children.map((v, k) => ({
			label: v.label,
			order: k + 1,
			condition: v.condition!,
			children: mapChildren(v.children),
		}));
	};

	const mapQuestionToCreateInput: (
		v: QuestionForm,
		k: number,
	) => CreateQuotationQuestionInput = (v, k) => {
		return {
			label: v.label,
			order: k + 1,
			quotation: res.data?.createQuotation?.id!,
			condition: v.condition!,
			children: mapChildren(v.children),
			active: v.active,
		};
	};

	await apiClient.mutate<
		CreateQuotationQuestionMutation,
		CreateQuotationQuestionMutationVariables
	>({
		mutation: CREATE_QUOTATION_QUESTION,
		variables: {
			input: values.questions.map(mapQuestionToCreateInput),
		},
	});

	return res.data?.createQuotation!;
};
