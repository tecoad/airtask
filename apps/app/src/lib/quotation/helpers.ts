import { QuestionForm } from './hooks';

type GroupedQuestion = Omit<QuestionForm, 'children'>;

export const recursiveGroupQuestionChildren = (
	questions: QuestionForm[],
	parentId?: string,
): GroupedQuestion[] => {
	return questions.reduce((acc, { children, ...question }) => {
		const updatedQuestion: GroupedQuestion = {
			...question,
			parentId,
		};
		return [
			...acc,
			updatedQuestion,
			...recursiveGroupQuestionChildren(children, question.id),
		];
	}, [] as GroupedQuestion[]);
};

export const buildNestedQuestionTree = (
	groupedQuestions: GroupedQuestion[],
	parentId?: string,
): QuestionForm[] => {
	const topLevelQuestions = groupedQuestions
		.sort((a, b) => a.order - b.order)
		.filter((question) =>
			parentId ? question.parentId === parentId : !question.parentId,
		);

	return topLevelQuestions.map((question) => ({
		...question,
		children: buildNestedQuestionTree(groupedQuestions, question.id),
	}));
};
