import {
	FLOW_CALL_HANDLER_XML_PATH,
	GENERATE_FIRST_TALK_IN_INTERACTION,
} from '@airtask/shared/dist/flow/constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { flow, flow_agent, flow_contact } from '@prisma/client';
import axios from 'axios';
import { Cache } from 'cache-manager';
import { MessageType } from 'langchain/schema';
import { ENV } from 'src/config/env';
import {
	CreateDebugInteractionResult,
	FlowAgentEditorType,
	FlowAgentVoice,
} from 'src/graphql';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { TwilioService } from 'src/modules/common/services/twilio.service';
import { EntityNotFoundError } from 'src/shared/errors';
import { FlowInteractionStatus } from 'src/shared/types/db';
import {
	makeSureStringNotEndsWithSlash,
	makeSureStringStartsWithSlash,
} from 'src/shared/utils/url';
import { v4 } from 'uuid';
import { DEFAULT_FLOW_INTERACTION_PROMPT } from '../constants/interaction-prompt';
import { FLOW_CALL_STATUS_CALLBACK_PATH } from '../constants/routes';
import { flowInteractionCacheKey } from './constants';
import { FlowCalendarIntegrationSettings } from './flow-calendar-integration.service';

export type FlowInteractionCache = {
	prompt: string;
	voice: FlowAgentVoice;
	flow_contact: {
		first_name: string;
	};
	agent: {
		language: string | null;
		calendar_integration?: FlowCalendarIntegrationSettings;
	};
	history: { content: string; role: MessageType; talkId: string }[];
};

@Injectable()
export class FlowInteractionService {
	constructor(
		private readonly prisma: PrismaService,
		@Inject(CACHE_MANAGER) private readonly cacheService: Cache,
		private readonly twilioService: TwilioService,
	) {}

	async createOutboundInteraction(
		input: {
			agentId: string;
			interactionData:
				| {
						phoneNumber: string;
						prospectName: string;
				  }
				| {
						flow: flow;
						contact: flow_contact;
				  };
			debugAsInbound?: boolean;
		},
		_agent?: flow_agent,
	): Promise<CreateDebugInteractionResult> {
		const agent =
			_agent ||
			(await this.prisma.flow_agent.findUnique({
				where: {
					id: String(input.agentId),
				},
			}));

		if (!agent) {
			throw new EntityNotFoundError('flow_agent', input.agentId);
		}

		const interaction = await this.prisma.flow_interaction.create({
			data: {
				id: v4(),
				account: agent.account,
				agent: agent.id,
				status: FlowInteractionStatus.Requested,
				...('phoneNumber' in input.interactionData
					? {
							contact_name: input.interactionData.prospectName,
							contact_phone: input.interactionData.phoneNumber,
						}
					: {
							contact_name: `${input.interactionData.contact.first_name} ${input.interactionData.contact.last_name}`,
							contact_phone: input.interactionData.contact.phone,
							contact: input.interactionData.contact.id,
							flow: input.interactionData.flow.id,
						}),
				history: [],
			},
		});

		const newCacheData = await this.createInteractionCacheData({
			agent,
			contact: {
				first_name:
					'phoneNumber' in input.interactionData
						? input.interactionData.prospectName
						: input.interactionData.contact.first_name,
			},
		});

		// Update in redis
		await this.cacheService.store.set(
			flowInteractionCacheKey({ interactionId: interaction.id }),
			newCacheData,
			// 24 hours
			{ ttl: 3600 * 24 } as any,
		);

		const callVoiceUrl =
			makeSureStringNotEndsWithSlash(ENV.FLOW_CALLER.url!) +
			FLOW_CALL_HANDLER_XML_PATH.join('').replace(':interactionId', interaction.id);

		if (input.debugAsInbound) {
			// Update number xml
			await this.twilioService.client.incomingPhoneNumbers
				.get('PN70e0ddfea2176c8fe137c7f524eeb57f')
				.update({
					statusCallback:
						makeSureStringNotEndsWithSlash('https://api.airtask.dev') +
						makeSureStringStartsWithSlash(FLOW_CALL_STATUS_CALLBACK_PATH.join('')),
					voiceUrl: callVoiceUrl,
				});
		} else {
			await axios.post(
				makeSureStringNotEndsWithSlash(ENV.FLOW_CALLER.url!) +
					GENERATE_FIRST_TALK_IN_INTERACTION.join('').replace(
						':interactionId',
						interaction.id,
					),
			);

			if (!ENV.isTesting) {
				const result = await this.twilioService.client.calls.create({
					from: ENV.TWILIO.outbound_calls_number!,
					to: interaction.contact_phone,
					url: callVoiceUrl,
					method: 'GET',
					statusCallback: ENV.TWILIO.flow_calls_webhooks_url(
						FLOW_CALL_STATUS_CALLBACK_PATH.join(''),
					),
					statusCallbackMethod: 'POST',
					statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
					// statusCallback: ENV.TWILIO.webhook_url(FLOW_CALL_STATUS_CALLBACK_PATH.join('')),
				});

				await this.prisma.flow_interaction.update({
					where: {
						id: interaction.id,
					},
					data: {
						external_id: result.sid,
					},
				});
			}
		}

		return {
			interactionId: interaction.id,
		};
	}

	async createInteractionCacheData({
		agent,
		contact,
	}: {
		agent: flow_agent;
		contact: FlowInteractionCache['flow_contact'];
	}) {
		let prompt: string | null = null;
		switch (agent.editor_type) {
			case FlowAgentEditorType.advanced: {
				prompt = agent.script!;

				break;
			}
			case FlowAgentEditorType.standard:
			default: {
				prompt = DEFAULT_FLOW_INTERACTION_PROMPT.replace(
					'{standardScript}',
					agent.script!,
				);

				break;
			}
		}

		const replace = (key: string, value: string) => {
			prompt = prompt || '';

			prompt = prompt.replaceAll(`{${key}}`, value);
		};

		replace('prospectName', contact.first_name);

		if (agent.knowledge_base) {
			const knowledgeBaseQAsm2m =
				await this.prisma.knowledge_base_qa_knowledge_base.findMany({
					where: {
						knowledge_base_id: agent.knowledge_base,
					},
					include: {
						knowledge_base_qa: true,
					},
				});

			const knowledgeBaseQAs = knowledgeBaseQAsm2m.flatMap((v) =>
				v.knowledge_base_qa ? v.knowledge_base_qa : [],
			);

			const str = knowledgeBaseQAs
				.map((v) =>
					`
Question: ${v.question}
Answer: ${v.answer}
			`.trim(),
				)
				.join('\n\n');

			replace('knowledgeBase', str);
		}

		prompt = this.replaceBraces(prompt);

		const newCacheData: FlowInteractionCache = {
			prompt,
			voice: agent.voice as FlowAgentVoice,
			flow_contact: {
				first_name: contact.first_name,
			},
			agent: {
				language: agent.script_language,
			},
			history: [],
		};

		if (agent.calendar) {
			const calendarIntegration = await this.prisma.flow_integration_calendar.findFirst({
				where: {
					id: agent.calendar,
				},
			});

			if (calendarIntegration) {
				newCacheData.agent.calendar_integration =
					calendarIntegration.settings as any as FlowCalendarIntegrationSettings;
			}
		}

		return newCacheData;
	}

	replaceBraces(input: string): string {
		const regex = /{([^}]+)}/g;

		const result = input.replaceAll(regex, '');

		return result;
	}
}
