import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import {
	account,
	quotation,
	quotation_conversation,
	quotation_question,
} from '@prisma/client';
import { Queue } from 'bull';
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from 'langchain/schema';
import { Observable } from 'rxjs';
import { ENV } from 'src/config/env';
import { AccountUsageKind } from 'src/graphql';
import { AccountsService } from 'src/modules/accounts/services/accounts.service';

import { ChatOpenAI, PromptLayerChatOpenAI } from 'langchain/chat_models/openai';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { UsageManagerService } from 'src/modules/subscriptions/services/usage-manager.service';
import { sanitizeEmail, sanitizeName } from 'src/modules/users/utils/sanitize';
import {
	QuotationConversationMessage as GraphqlQuotationConversationMessage,
	QuotationAvailabilityError,
	QuotationAvailabilityErrorCode,
	QuotationConversationRecipientInput,
} from 'src/public-graphql';
import { EntityNotFoundError } from 'src/shared/errors/entity-not-found.error';
import { ID, QuotationConversationStatus, QuotationStatus } from 'src/shared/types/db';
import { generateRandomCode } from 'src/shared/utils/random-code';
import { setupLangSmithTracer } from 'src/shared/utils/setup-langsmith-tracer';
import { v4 } from 'uuid';
import { QuotationConversationMessage, QuotationMessageRole } from '../../accounts/types';
import { CREATE_QUOTATION_BUDGET_JOB, QUOTATIONS_QUEUE } from '../jobs/constants';
import { QuotationsQueueData } from '../jobs/quotations.queue';
import { quotationConversationToRecipient } from '../utils/normalize';
import { quotationConversationSystemPrompt } from '../utils/prompts';

@Injectable()
export class PublicQuotationsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly usageManagerService: UsageManagerService,
		@InjectQueue(QUOTATIONS_QUEUE)
		private readonly quotationsQueue: Queue<QuotationsQueueData>,
		private readonly accountsService: AccountsService,
	) {}

	async findPublic(
		hash?: string,
		id?: ID,
	): Promise<
		| (quotation & {
				account_quotation_accountToaccount: account | null;
				quotation_question_quotation_question_quotationToquotation: quotation_question[];
		  })
		| QuotationAvailabilityError
	> {
		const data = await this.prisma.quotation.findFirst({
			where: {
				...(id ? { id: String(id) } : { hash }),
				status: QuotationStatus.Published,
			},
			include: {
				account_quotation_accountToaccount: true,
				quotation_question_quotation_question_quotationToquotation: true,
			},
		});

		if (!data)
			return {
				errorCode: QuotationAvailabilityErrorCode.QUOTATION_NOT_FOUND,
				message: 'Quotation not found',
			};

		const accountCheck =
			await this.usageManagerService.isAccountAllowedToPerformOperation(
				data.account!,
				AccountUsageKind.quotation,
				1,
			);

		if (!accountCheck) {
			return {
				errorCode: QuotationAvailabilityErrorCode.QUOTATION_WITHOUT_ACTIVE_SUBSCRIPTION,
				message: 'Account has no subscription',
			};
		}

		return data;
	}

	async findPublicWithoutAvailabilityCheck(hash?: string, id?: ID) {
		return this.prisma.quotation.findFirst({
			where: {
				...(id ? { id: String(id) } : { hash }),
			},
		});
	}

	async findQuotationConversation(
		id: ID,
	): Promise<quotation_conversation | QuotationAvailabilityError> {
		const conversation = await this.prisma.quotation_conversation.findUnique({
			where: { id: Number(id) },
		});

		if (!conversation?.quotation) {
			return {
				message: 'Quotation not found',
				errorCode: QuotationAvailabilityErrorCode.QUOTATION_NOT_FOUND,
			};
		}

		return conversation;
	}

	async sendQuotationConversationMessage(id: ID, input: string) {
		const conversation = await this.prisma.quotation_conversation.findUniqueOrThrow({
			where: { id: Number(id) },
			include: {
				quotation_quotation_conversation_quotationToquotation: {
					include: {
						account_quotation_accountToaccount: true,
						quotation_question_quotation_question_quotationToquotation: true,
					},
				},
			},
		});
		if (!conversation) throw new EntityNotFoundError('quotation_conversation', id);

		return this.promptQuotationConversation(conversation, input);
	}

	promptQuotationConversation(
		conversation: quotation_conversation & {
			quotation_quotation_conversation_quotationToquotation:
				| (quotation & {
						account_quotation_accountToaccount: account | null;
				  })
				| null;
		},
		input?: string,
	) {
		return new Observable<{ token: string } | GraphqlQuotationConversationMessage>(
			(obs) => {
				(async () => {
					const userInputAt = new Date();

					const quotation =
							conversation.quotation_quotation_conversation_quotationToquotation,
						account = quotation?.account_quotation_accountToaccount,
						messages = conversation.message as any as QuotationConversationMessage[];

					if (!quotation) throw new EntityNotFoundError('quotation', 'null');

					const questions = await this.prisma.quotation_question.findMany({
						where: {
							quotation: quotation.id,
						},
					});

					const { plan: accountPlan } = await this.accountsService.findSubscriptionPlan(
						account!,
					);

					const llm = new (
						ENV.OPENAI.use_prompt_layer ? PromptLayerChatOpenAI : ChatOpenAI
					)({
						modelName: accountPlan?.quotation_model_name ?? 'gpt-3.5-turbo-0613',
						callbacks: [
							{
								handleLLMNewToken(token) {
									obs.next({ token });
								},
							},
							setupLangSmithTracer({
								projectNameSuffix: 'quotation',
							}),
						],
						streaming: true,
						verbose: ENV.QUOTATION.ai_verbose_mode,
						maxTokens: 120,
						temperature: 0,
						frequencyPenalty: 0,
						// presencePenalty: -2,
					});

					const history = messages.map((v) => {
						const c = v.role === QuotationMessageRole.Customer ? HumanMessage : AIMessage;

						return new c(v.content);
					});

					const res = await llm.call(
						[
							new SystemMessage(
								await quotationConversationSystemPrompt({
									account: account!,
									conversation,
									questions,
									quotation,
								}),
							),
							...history,
							input && new HumanMessage(input),
						].filter(Boolean) as BaseMessage[],
					);

					const newMessage = await this.saveAndReplyUserMessage(
						conversation,
						input,
						userInputAt,
						{
							content: res.text,
						},
					);

					// End of interaction
					const isEndingMessage = newMessage.content.includes(conversation.code!);

					if (isEndingMessage) {
						await this.saveConversationBudget(conversation);
					}

					obs.next({
						...newMessage,
						role: newMessage.role as any,
						// This will never be saved at database because is a abstract field
						// But we need to send this to client side
						// So we send null instead of false to avoid confusion and at test e2e
						is_ending_message: isEndingMessage === true ? true : null,
					});

					obs.complete();
				})();
			},
		);
	}

	async saveConversationBudget(conversation: quotation_conversation) {
		// Only this we take off the job because need to be executed now
		await this.prisma.quotation_conversation.update({
			where: {
				id: conversation.id,
			},
			data: {
				status: QuotationConversationStatus.Finished,
			},
		});

		// Don't create budget if is testing because it will consume open ai credits
		if (ENV.isTesting) {
			return;
		}

		await this.quotationsQueue.add(
			CREATE_QUOTATION_BUDGET_JOB,
			{
				quotationConversationId: conversation.id,
			},
			{
				jobId: `${CREATE_QUOTATION_BUDGET_JOB}-${conversation.id}`,
				attempts: 4,
			},
		);
	}

	async saveAndReplyUserMessage(
		conversation: quotation_conversation,
		input: string | undefined,
		input_date: Date | undefined,
		reply: Pick<QuotationConversationMessage, 'content'>,
	) {
		const botReply: QuotationConversationMessage = {
				id: v4(),
				role: QuotationMessageRole.Agent,
				sent_at: new Date(),
				...reply,
			},
			userMessage: QuotationConversationMessage | null = input
				? {
						id: v4(),
						content: input,
						role: QuotationMessageRole.Customer,
						sent_at: input_date || new Date(),
				  }
				: null;

		await this.prisma.quotation_conversation.update({
			where: { id: conversation.id },
			data: {
				message: (<QuotationConversationMessage[]>[
					...(conversation.message as any as []),
					// Input is optional
					...[userMessage].filter(Boolean),
					botReply,
				]) as any,
			},
		});

		return botReply;
	}

	initQuotationConversation(
		hash: string,
		recipient: QuotationConversationRecipientInput | undefined,
	) {
		if (recipient) {
			recipient.first_name = sanitizeName(recipient.first_name);
			recipient.last_name = sanitizeName(recipient.last_name);
			recipient.email = sanitizeEmail(recipient.email);
		}

		return new Observable<
			| QuotationAvailabilityError
			| quotation_conversation
			| { token: string }
			| GraphqlQuotationConversationMessage
		>((obs) => {
			(async () => {
				const quotation = await this.findPublic(hash);

				if (quotation && 'errorCode' in quotation) {
					obs.next(quotation);
					obs.complete();

					return;
				}

				const conversation = await this.prisma.quotation_conversation.create({
					data: {
						quotation: quotation.id,
						message: [],
						code: generateRandomCode(6),
						recipient_email: recipient?.email,
						recipient_first_name: recipient?.first_name,
						recipient_last_name: recipient?.last_name,
						recipient_phone: recipient?.phone,
						status: QuotationConversationStatus.Active,
					},
					include: {
						quotation_quotation_conversation_quotationToquotation: {
							include: {
								account_quotation_accountToaccount: true,
							},
						},
					},
				});

				// Send conversation to client side so it can be used to load the config of widget
				obs.next(conversation);

				this.promptQuotationConversation(conversation).subscribe({
					next: (value) => {
						obs.next(value);
					},
					error: (err) => obs.error(err),
					complete: () => obs.complete(),
				});
			})();
		});
	}

	async updateQuotationConversationRecipient(
		quotationConversationId: ID,
		recipient: QuotationConversationRecipientInput,
	) {
		recipient.first_name = sanitizeName(recipient.first_name);
		recipient.last_name = sanitizeName(recipient.last_name);
		recipient.email = sanitizeEmail(recipient.email);

		const quotationConversation = await this.prisma.quotation_conversation.update({
			where: { id: Number(quotationConversationId) },
			data: {
				recipient_email: recipient.email,
				recipient_first_name: recipient.first_name,
				recipient_last_name: recipient.last_name,
				recipient_phone: recipient.phone,
			},
		});

		return quotationConversationToRecipient(quotationConversation);
	}
}
