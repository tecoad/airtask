import {
	account,
	quotation,
	quotation_conversation,
	quotation_question,
} from '@prisma/client';
import { pull } from 'langchain/hub';
import { ChatPromptTemplate, PromptTemplate } from 'langchain/prompts';
// import {
// 	promptQuestionsExample,
// 	promptQuestionsInteractionExample,
// } from 'src/modules/quotations/utils/prompting-data';
import { ENV } from 'src/config/env';
import { buildNestedQuestionTree, questionTreeToString } from './recursive-questions';

export const quotationConversationSystemPrompt = async ({
	conversation,
	questions,
	// account,
	quotation,
}: {
	account: account;
	quotation: quotation;
	questions: quotation_question[];
	conversation: quotation_conversation;
}) => {
	const questionTreeString = questionTreeToString(buildNestedQuestionTree(questions));
	// const	examplesQuestionTreeString = questionTreeToString(promptQuestionsExample);

	// const interactionsExample = promptQuestionsInteractionExample({
	// 	accountName: account.name!,
	// 	conversationCode: conversation.code!,
	// });

	const about = quotation.prompt_instructions
		? `${quotation.prompt_instructions}`
		: `do profissional que definiu as perguntas a seguir a serem feitas`;

	const prompt = (await pull(ENV.LANGSMITH.repo_name('quotation'), {
		apiKey: ENV.LANGSMITH.api_key,
	})) as ChatPromptTemplate;

	let template = (prompt.promptMessages[0].lc_kwargs.prompt as PromptTemplate).lc_kwargs
		.template;

	const templateVariables = {
		questionTreeString,
		// examplesQuestionTreeString,
		// interactionsExample,
		code: conversation.code!,
		about,
		recipient_email: conversation.recipient_email!,
		recipient_phone: conversation.recipient_phone!,
		recipient_first_name: conversation.recipient_first_name!,
	} satisfies Record<string, string>;

	for (const [key, value] of Object.entries(templateVariables)) {
		template = template.replaceAll(`{${key}}`, value);
	}

	return template;
};
