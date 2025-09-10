import { Process, Processor } from '@nestjs/bull';
import { Inject, forwardRef } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Job } from 'bull';
import {
	ClientEvents,
	Collection,
	MessageCreateOptions,
	MessagePayload,
	Serialized,
	TextChannel,
} from 'discord.js';
import { ENV } from 'src/config/env';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { SystemNotificationsService } from 'src/modules/common/services/system-notifications.service';
import { BaseDiscordCommand } from '../commands/base';
import { BaseDiscordEvent } from '../events/base';
import { DiscordBotService } from '../services/discord-bot.service';

export const DISCORD_INTERACTIONS_QUEUE = 'discord-commands-queue';
export const REPLY_MESSAGE_JOB = 'reply-message-job';
export const EXECUTE_COMMAND_JOB = 'execute-command-job';
export const PROCESS_EVENT_JOB = 'process-event-job';

export type ReplyMessageData = {
	channelId: string;
	messageId: string;
	input: string | MessagePayload | MessageCreateOptions;
};
export type ProcessCommandJob = {
	commandName: string;
	channelId: string;
	messageId: string;
};
export type ProcessEventJob = {
	processorId: string;
	event: Serialized<ClientEvents[keyof ClientEvents]>;
};

export type DiscordInteractionsQueueData =
	| ReplyMessageData
	| ProcessCommandJob
	| ProcessEventJob;

@Processor(DISCORD_INTERACTIONS_QUEUE)
export class DiscordInteractionsQueue {
	commands: Collection<string, BaseDiscordCommand>;
	events: Collection<string, BaseDiscordEvent<any>>;

	constructor(
		@Inject(forwardRef(() => DiscordBotService))
		private readonly discord: DiscordBotService,
		private readonly systemNotificationsService: SystemNotificationsService,
		private readonly prisma: PrismaService,
		private moduleRef: ModuleRef,
	) {}

	async onDataLoad({
		commands,
		events,
	}: {
		commands: Collection<string, BaseDiscordCommand>;
		events: Collection<string, BaseDiscordEvent<any>>;
	}) {
		this.commands = commands;
		this.events = events;
	}

	@Process(REPLY_MESSAGE_JOB)
	async replyMessage(job: Job<ReplyMessageData>) {
		const { channelId, messageId, input } = job.data;
		const channel = (await this.discord.channels.cache.get(channelId)) as TextChannel;
		const message = channel.messages.cache.get(messageId);

		await message?.reply(input);
	}

	@Process(EXECUTE_COMMAND_JOB)
	async processCommand(job: Job<ProcessCommandJob>) {
		const { commandName, messageId, channelId } = job.data;
		const command = this.commands.find((item) => item.config.name === commandName);

		if (!command) return;

		const ch = this.discord.channels.cache.get(channelId) as TextChannel;
		const message = ch.messages.cache.get(messageId);

		if (!message) throw new Error('Message not found by id');

		message.react('⏱️');

		const args = message.content
			.slice(ENV.DISCORD.commands_prefix!.length)
			.trim()
			.split(/ +/);

		const result = await command.config.execute(message, args, {
			resolveDependency: (typeOrToken) => {
				return this.moduleRef.resolve(typeOrToken, undefined, {
					strict: false,
				});
			},
		});

		job.progress(100);

		return {
			success: true,
			result,
		};
	}

	@Process(PROCESS_EVENT_JOB)
	async processEvent(job: Job<ProcessEventJob>) {
		const { processorId, event } = job.data;
		const eventProcessor = this.events.find((item) => item.processorId === processorId);
		if (!eventProcessor) return;

		const result = await eventProcessor.config.handle(
			{
				resolveDependency: (typeOrToken) => {
					return this.moduleRef.resolve(typeOrToken, undefined, {
						strict: false,
					});
				},
			},
			...event,
		);

		job.progress(100);

		return {
			success: true,
			result,
		};
	}
}
