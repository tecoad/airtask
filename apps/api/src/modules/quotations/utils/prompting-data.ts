import { AIMessage, BaseMessage, HumanMessage } from 'langchain/schema';
import { QuestionWithChild } from 'src/modules/quotations/utils/recursive-questions';
import { sanitizeName } from 'src/modules/users/utils/sanitize';

export const FINISH_CONVERSATION_FUNCTION_NAME = 'no_more_questions_report';

export const promptQuestionsExample: QuestionWithChild[] = [
	{
		label: 'Qual o dia do evento?',
		condition: null,
		children: [
			{
				condition: 'Se for em dezembro',
				label: 'Qual o dia de dezembro?',
				children: [],
			},
		],
	},
	{
		label: 'Qual o número de convidados?',
		condition: null,
		children: [
			{
				condition: 'Mais que 220',
				label: 'Quem fez o buffet?',
				children: [],
			},
			{
				condition: 'entre 221 e 500',
				label: 'Qual o show?',
				children: [],
			},
		],
	},
];

export const promptQuestionsInteractionExample = ({
	accountName,
	conversationCode,
}: {
	accountName: string;
	conversationCode: string;
}) => {
	const arrayExamples = [
		new AIMessage('Qual será o dia do seu evento?'),
		new HumanMessage('Dezembro de 2024.'),
		new AIMessage('Qual o dia de dezembro?'),
		new HumanMessage('25 de dezembro.'),
		new AIMessage('Qual será o número de convidados?'),
		new HumanMessage('100.'),
		'Agora, a AI raciocinou que todas as perguntas necessárias foram respondidas, e irá finalizar o atendimento.',
		new AIMessage(
			`Obrigado pelas informações. Irei encaminhar as informações para o ${accountName}. O código da sua solicitação é ${conversationCode}.`,
		),
		'The end.',
	];

	return arrayExamples
		.map((item) => {
			if (item instanceof BaseMessage) {
				return `${sanitizeName(item._getType())}: ${item.text}`;
			}

			// String, is a comment
			return `"""${item}"""`;
		})
		.join('\n');
};
