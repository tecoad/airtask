import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { MessageType } from 'langchain/schema';
import { v4 } from 'uuid';
import { BaseDiscordCommand } from './base';

export const getAiAssistantWatchCacheKey = (userId: string, channelId: string) =>
	`discord-ai-assistant-watch-${userId}-${channelId}`;
export type AiAssistantWatchCacheData = {
	history: {
		role: MessageType;
		content: string;
		name?: string;
		functionRunId?: string;
	}[];
};

export default new BaseDiscordCommand({
	name: 'aihelp',
	description: 'Todos os comandos disponíveis para o assistente de IA',
	async execute(message, args, { resolveDependency }) {
		const cacheManager: Cache = await resolveDependency(CACHE_MANAGER);

		await cacheManager.set(
			getAiAssistantWatchCacheKey(message.author.id, message.channelId),
			<AiAssistantWatchCacheData>{
				history: [],
			},
			//24 hours
			{ ttl: 3600 * 24 } as any,
		);

		message.reply({
			content:
				'Todas as mensagems enviadas por você neste canal agora estarão sendo utilizadas como parte de uma conversa com contexto das últimas 5 mensagens de texto enviadas.',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setLabel('Clique aqui')
						.setStyle(ButtonStyle.Success)
						.setCustomId(v4()),
				),
			],
		});
	},
	permissions: ['Administrator'],
});
