import { initializeAgentExecutorWithOptions } from 'langchain/agents';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	DMChannel,
	EmbedBuilder,
	TextChannel,
} from 'discord.js';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BufferMemory, ChatMessageHistory } from 'langchain/memory';
import { AIMessage, FunctionMessage, HumanMessage } from 'langchain/schema';
import { setupLangSmithTracer } from 'src/shared/utils/setup-langsmith-tracer';
import { v4 } from 'uuid';
import {
	AiAssistantWatchCacheData,
	getAiAssistantWatchCacheKey,
} from '../commands/ai-assistant';
import { AiAssistantToolsService } from '../services/ai-assistant-tools.service';
import { DiscordBotService } from '../services/discord-bot.service';
import { BaseDiscordEvent } from './base';

export default new BaseDiscordEvent({
	name: 'messageCreate',
	async handle({ resolveDependency }, message) {
		const cacheManager: Cache = await resolveDependency(CACHE_MANAGER),
			discord = await resolveDependency(DiscordBotService),
			aiAssistantToolsService = await resolveDependency(AiAssistantToolsService);

		const data = await cacheManager.get<AiAssistantWatchCacheData>(
			getAiAssistantWatchCacheKey(message.author.id, message.channelId),
		);
		if (!data) return;

		const channel = discord.channels.cache.get(message.channelId);
		if (!(channel instanceof TextChannel) && !(channel instanceof DMChannel)) return;

		// If message.member is null means the message was send by
		// private message, then we fetch on Postless server to get
		// guild member and resolve user permissions
		const member =
			message.member ||
			discord.guilds.cache
				.get(discord.config.guild_id!)!
				.members.cache.get(message.author.id)!;

		const userIsAdmin = member.permissions.has('Administrator');

		if (!userIsAdmin) {
			await cacheManager.del(
				getAiAssistantWatchCacheKey(message.author.id, message.channelId),
			);
			return;
		}

		let replyMessage = await message.reply({
			content: 'Pensando..',
		});

		const llm = new ChatOpenAI({
			modelName: 'gpt-3.5-turbo',
			temperature: 1,
			topP: 0.5,
			// maxTokens: 300,
			callbacks: [setupLangSmithTracer({ projectNameSuffix: 'ai-discord-assistante' })],

			frequencyPenalty: 0,
			presencePenalty: 0,
		});
		const memory = new BufferMemory({
			chatHistory: new ChatMessageHistory([
				...data.history.slice(-5).map((v) => {
					const types = {
						ai: AIMessage,
						human: HumanMessage,
						function: FunctionMessage,
					} as const;

					const c = types[v.role];

					return new c({
						content: v.content,
						name: v.name,
					});
				}),
			]),
			memoryKey: 'chat_history',

			returnMessages: true,
		});

		const runIdNotConfirmeds: string[] = [];
		const toolRuns: Record<string, Record<string, unknown> | any[] | string> = {};

		const tools = aiAssistantToolsService.loadTools({
			onActionEnd(name, output, runId) {
				data.history.push({
					functionRunId: runId,
					content: output,
					role: 'function',
					name,
				});
			},
			callbacks: [
				{
					handleToolEnd(output, runId, parentRunId, tags) {
						try {
							const data = JSON.parse(output);
							toolRuns[runId] = data;
						} catch {
							toolRuns[runId] = output;
						}
					},
					handleToolError(err, runId, parentRunId, tags) {
						console.log(err);
					},
				},
			],
			async waitActionConfirm({ actionName, input }) {
				replyMessage.edit({
					content: `Confirme que você realmente deseja realizar a ação "${actionName}"`,
					embeds: [
						new EmbedBuilder()
							.setTitle('Confirmação de ação necessária')
							.setDescription('Parâmetros:')
							.setFields(
								Object.keys(input).map((key) => {
									const value = input[key];
									return {
										name: key,
										value:
											typeof value === 'object' ? JSON.stringify(value) : String(value),
									};
								}),
							),
					],
				});
				await replyMessage.react('❌');
				await replyMessage.react('✅');

				const updateAfterReaction = async () => {
					replyMessage.delete();
					replyMessage = await message.reply({
						content: 'Pensando..',
					});
				};

				try {
					const collection = await replyMessage.awaitReactions({
						filter: (reaction, user) => {
							return (
								['✅', '❌'].includes(reaction.emoji.name!) &&
								user.id === message.author.id
							);
						},
						max: 1,
						time: 10000,
					});

					updateAfterReaction();

					const allowed = collection.first()?.emoji.name === '✅';

					if (!allowed) runIdNotConfirmeds.push(input.runId);

					return {
						allowed,
						reason: 'choice',
					};
				} catch {
					updateAfterReaction();

					runIdNotConfirmeds.push(input.runId);

					return {
						allowed: false,
						reason: 'timeout',
					};
				}
			},
		});

		const executor = await initializeAgentExecutorWithOptions(tools, llm, {
			agentType: 'openai-functions',
			maxIterations: 3,
			verbose: false,
			memory,
			agentArgs: {
				prefix: `
Você é o assistente virtual do gestor da empresa AirTask de nome "${message.author.globalName}".					
Sempre chame-o pelo seu nome, e não pelo seu cargo.

Sempre que uma função retornar a mensagem "acao_cancelada", você deve escrever uma mensagem dizendo que o usuário
não concordou em prosseguir com a ação.
Importante: Se o usuário cancelou uma ação, e depois tentar fazer a mesma ação, você deve chamar a função novamente
e deixá-la sempre decidir se quer ou não prosseguir com a ação.
Nunca decida se o usuário concordou ou não com a ação, essa é uma função do sistema questioná-lo e te informar.

					`.trim(),
			},
		});

		const { output: response } = await executor.invoke({
			input: message.content,
		});

		const lastHistory = data.history[data.history.length - 1];
		const lastFunctionExecuted =
			lastHistory?.role === 'function'
				? tools.find((item) => item.name === lastHistory.name)
				: undefined;

		data.history.push(
			{
				content: message.content,
				role: 'human',
			},
			{
				content: response,
				role: 'ai',
			},
		);

		replyMessage.edit({
			content: response as any,
			components:
				lastFunctionExecuted?.metadata?.actions &&
				!runIdNotConfirmeds.includes(lastHistory.functionRunId!)
					? typeof toolRuns[lastHistory.functionRunId!] === 'object'
						? [
								new ActionRowBuilder<ButtonBuilder>().addComponents(
									...[
										(lastFunctionExecuted.metadata.actions as string[]).map((v) =>
											new ButtonBuilder()
												.setLabel(v)
												.setStyle(ButtonStyle.Success)
												.setCustomId(v4()),
										),
									],
								),
							]
						: undefined
					: undefined,
		});

		await cacheManager.set(
			getAiAssistantWatchCacheKey(message.author.id, message.channelId),
			data,
			//24 hours
			{ ttl: 3600 * 24 } as any,
		);
	},
});
