import { Process, Processor } from '@nestjs/bull';
import { quotation_conversation } from '@prisma/client';
import { Job } from 'bull';
import { OpenAI } from 'langchain/llms/openai';
import {
	AccountRole,
	AccountUsageKind,
	LanguageCode,
	OnBoardingStepName,
} from 'src/graphql';
import { OnBoardingStepsService } from 'src/modules/accounts/services/onboard-steps.service';
import { EmailService } from 'src/modules/common/services/email.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { UsageManagerService } from 'src/modules/subscriptions/services/usage-manager.service';
import { v4 } from 'uuid';
import { QuotationConversationMessage, QuotationMessageRole } from '../../accounts/types';
import { AccountQuotationsRequestsService } from '../services/account-quotations-requests.service';
import { QuotationRequestData } from '../types';
import { CREATE_QUOTATION_BUDGET_JOB, QUOTATIONS_QUEUE } from './constants';

type QuotationBudgetJobData = {
	quotationConversationId: number;
};

export type QuotationsQueueData = QuotationBudgetJobData;

@Processor(QUOTATIONS_QUEUE)
export class QuotationsQueue {
	constructor(
		private readonly usageManagerService: UsageManagerService,
		private readonly prisma: PrismaService,
		private readonly emailService: EmailService,
		private readonly onboardingSteps: OnBoardingStepsService,
		private readonly quotationsRequestsService: AccountQuotationsRequestsService,
	) {
		// (async () => {
		//   const a = await this.extractQuestionsFromConversation(
		//     {
		//       log: () => ({}),
		//     } as any,
		//     await this.prisma.quotation_conversation.findUniqueOrThrow({
		//       where: { id: 1043 },
		//     }),
		//   );
		// })();
	}

	@Process(CREATE_QUOTATION_BUDGET_JOB)
	async createQuotationBudgetJob(job: Job<QuotationBudgetJobData>) {
		const { quotationConversationId } = job.data;

		const conversation = await this.prisma.quotation_conversation.findUniqueOrThrow({
				where: {
					id: quotationConversationId,
				},
				include: {
					quotation_quotation_conversation_quotationToquotation: {
						include: {
							account_quotation_accountToaccount: {
								include: {
									account_user: true,
								},
							},
						},
					},
				},
			}),
			quotation = conversation.quotation_quotation_conversation_quotationToquotation,
			account = quotation?.account_quotation_accountToaccount;

		this.onboardingSteps.queueEnsureStepForAccount(
			account!.id,
			OnBoardingStepName.receive_first_quotation_request,
		);

		const answersByQuestion = await this.extractQuestionsFromConversation(
			job,
			conversation,
		);

		const request = await this.prisma.$transaction(async (trx) => {
			const sequentialId =
				await this.quotationsRequestsService.generateQuotationSequentialId(
					trx,
					quotation!.id,
				);

			const request = await trx.quotation_request.create({
				data: {
					id: v4(),
					quotation_conversation: conversation.id,
					request_data: answersByQuestion,
					account: account?.id,
					quotation: quotation?.id,
					sequential_id: sequentialId,
				},
			});

			await this.usageManagerService.createAccountUsageForOperation(
				quotation!.account!,
				AccountUsageKind.quotation,
				1,
			);

			return request;
		});

		const ownerUserAccount = account?.account_user.find(
			(item) => item.role === AccountRole.owner,
		);
		const ownerUser = await this.prisma.user.findUniqueOrThrow({
			where: { id: ownerUserAccount!.user_id! },
		});

		await this.emailService.sendQuotationNotification(
			ownerUser.email,
			{
				requester_email: conversation.recipient_email!,
				requester_phone: conversation.recipient_phone!,
				requester_name: `${conversation.recipient_first_name} ${conversation.recipient_last_name}`,
				user_firstname: ownerUser.first_name!,
				questions: Object.keys(answersByQuestion).map((question) => ({
					answer: answersByQuestion[question],
					question: question,
				})),
				languageCode: ownerUser.language as LanguageCode,
			},
			{
				replyTo: conversation.recipient_email!,
			},
		);

		await job.progress(100);

		return {
			success: true,
			createdRequestId: request.id,
		};
	}

	async extractQuestionsFromConversation(
		job: Job<QuotationBudgetJobData>,
		conversation: quotation_conversation,
	): Promise<QuotationRequestData> {
		const llm = new OpenAI({
			temperature: 0,
			maxTokens: -1,
		});

		const messages = conversation.message as any as QuotationConversationMessage[];

		const messagesStr = messages
			.slice(0, -1)
			.map((v) => {
				const role = v.role === QuotationMessageRole.Agent ? 'AI' : 'Humano';

				// Replace double quotes with single quotes
				const content = v.content.replaceAll('"', "'");

				return `${role}: ${content}`;
			})
			.join('\n');

		const result = await llm.call(
			`
Dado a seguinte conversa entre um humano e uma AI que auxilia no atendimento de orçamentos, extraia as perguntas e respostas da conversa e retorne em um objeto JSON válido, utilizando o seguinte formato:

---
Exemplo de resposta em JSON válido:
"""
{
  "Pergunta exemplo": "Resposta exemplo"
}
"""

Não se esqueça de que o seu resultado será usado programaticamente, então é de extrema importância que o resultado seja um JSON válido.

---
A conversa:
"""
${messagesStr}
"""
  
O resumo em JSON válido:`.trim(),
		);

		job.log(
			`Open AI result to parse data from conversation: 
      
      ${result}
      `,
		);

		let answersByQuestion: QuotationRequestData;

		try {
			const parsed = JSON.parse(result);

			// Verify if the result is a valid JSON object record string string
			if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
				throw new Error('Result from OpenAI is not a valid JSON object');
			}

			answersByQuestion = parsed;
		} catch {
			throw new Error('Error trying to parse result from OpenAI');
		}

		return answersByQuestion;
	}
}
