import { quotation_question } from '@prisma/client';

export type QuestionWithChild = Pick<quotation_question, 'condition' | 'label'> & {
	children: QuestionWithChild[];
};

export const buildNestedQuestionTree = (
	groupedQuestions: quotation_question[],
	parentId?: string,
): QuestionWithChild[] => {
	const topLevelQuestions = groupedQuestions
		.sort((a, b) => (a.order || 0) - (b.order || 0))
		.filter((question) => {
			if (!question.active) return false;

			return parentId ? question.parent === parentId : !question.parent;
		});

	return topLevelQuestions.map((question) => ({
		...question,
		children: buildNestedQuestionTree(groupedQuestions, question.id),
	}));
};

export const questionTreeToString = (
	questions: QuestionWithChild[],
	order?: string,
	depth = 0,
): string => {
	let result = '';
	const indent = ' '.repeat(depth * 2); // 2 spaces per depth level

	questions.forEach((question, index) => {
		const newOrder = order ? `${order}.${index + 1}` : index + 1;

		const conditionAttribute = question.condition
				? ` condition="${question.condition}"`
				: '',
			orderAttribute = ` order="${newOrder}"`;

		result += `\n${indent}<question${orderAttribute}${conditionAttribute}>${question.label}`;

		if (question.children.length > 0) {
			result += questionTreeToString(question.children, newOrder.toString(), depth + 1);
		}

		result += `\n${indent}</question>`;
	});

	if (depth === 0) {
		result += '\n<no-more-questions/>';
	}

	return result;
};

// Debug this fn
// console.log(questionTreeToString([
//   {
//     label: 'Qual o local do evento?',
//     children: [
//       {
//         label: 'Qual bairro de belo Horizonte?',
//         condition: 'Belo Horizonte',
//         children: [{
//           label: 'Não é perigoso aí?',
//           condition: 'for o serrão',
//           children: []
//         },{
//           label: 'Não é perigoso a2í?',
//           condition: 'for o serrão',
//           children: []
//         }],
//       },
//       {
//         label: 'Qual bairro em floripa?',
//         condition: 'Floripa',
//         children: [],
//       }
//     ],
//   },

// ]))
