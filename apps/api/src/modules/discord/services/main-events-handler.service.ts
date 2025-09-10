import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';
import { Collection } from 'discord.js';
import * as fs from 'fs';
import { Redis } from 'ioredis';
import * as path from 'path';
import { ENV } from 'src/config/env';
import { redisConfig } from 'src/config/redis.config';
import { hashArray } from 'src/shared/utils/hash-array';
import { BaseDiscordCommand } from '../commands/base';
import { BaseDiscordEvent } from '../events/base';
import {
	DISCORD_INTERACTIONS_QUEUE,
	DiscordInteractionsQueue,
	DiscordInteractionsQueueData,
	EXECUTE_COMMAND_JOB,
	ProcessCommandJob,
	REPLY_MESSAGE_JOB,
	ReplyMessageData,
} from '../queues/discord-interaction.queue';
import { DiscordBotService } from './discord-bot.service';

@Injectable()
export class DiscordMainEventsHandler implements OnModuleInit {
	commands = new Collection<string, BaseDiscordCommand>();
	events = new Collection<string, BaseDiscordEvent<any>>();

	constructor(
		private readonly discord: DiscordBotService,
		@InjectQueue(DISCORD_INTERACTIONS_QUEUE)
		private readonly interactionsQueue: Queue<DiscordInteractionsQueueData>,
		private readonly interactionsQueueProcessor: DiscordInteractionsQueue,
		private moduleRef: ModuleRef,
		@Inject(CACHE_MANAGER)
		private readonly cacheManager: Cache,
	) {}

	replyMessage(data: ReplyMessageData) {
		this.interactionsQueue.add(REPLY_MESSAGE_JOB, data, {
			jobId: data.messageId,
		});
	}

	async onModuleInit() {
		await this.setupCommandsCollection();
		await this.setupEventsCollection();

		this.interactionsQueueProcessor.onDataLoad({
			commands: this.commands,
			events: this.events,
		});

		this.discord.on('messageCreate', (message) => {
			const commandsPrefix = ENV.DISCORD.commands_prefix;
			if (!message.content.startsWith(commandsPrefix) || message.author.bot) return;

			const args = message.content.slice(commandsPrefix.length).trim().split(/ +/);
			const commandName = args[0].toLowerCase();

			const command = this.commands.find((item) => item.config.name === commandName);
			if (!command) {
				this.replyMessage({
					channelId: message.channelId,
					messageId: message.id,
					input: {
						content: 'Comando não encontrado',
					},
				});
				return;
			}

			// If message.member is null means the message was send by
			// private message, then we fetch on Postless server to get
			// guild member and resolve user permissions
			const member =
				message.member ||
				this.discord.guilds.cache
					.get(this.discord.config.guild_id!)!
					.members.cache.get(message.author.id)!;

			const allowedToPerform = !command.config.permissions
				? true
				: command.config.permissions[
						command.config.permissionsMode === 'all' ? 'every' : 'some'
					]((value) => member.permissions.has(value));

			if (!allowedToPerform) {
				this.replyMessage({
					channelId: message.channelId,
					messageId: message.id,
					input: {
						content: 'Você não tem permissão para executar este comando.',
					},
				});
			}

			this.interactionsQueue.add(
				EXECUTE_COMMAND_JOB,
				<ProcessCommandJob>{
					messageId: message.id,
					channelId: message.channelId,
					commandName: command.config.name,
				},
				{ jobId: message.id },
			);
		});
	}

	async setupCommandsCollection() {
		const cmdFiles = fs
			.readdirSync(path.join(__dirname, '../', 'commands'))
			.filter((item) => item.endsWith('.js') && item !== 'base.js');

		const resolvedCommands: BaseDiscordCommand[] = [];

		for (const file of cmdFiles) {
			const resolved: { default: BaseDiscordCommand } = await import(
				path.join(__dirname, '../', 'commands', file)
			);

			const command = resolved.default;

			command.queue = this.interactionsQueue;

			resolvedCommands.push(command);
			this.commands.set(command.config.name, command);
		}

		for (const command of resolvedCommands) {
			const withSameName = resolvedCommands.filter(
				(item) => item.config.name === command.config.name,
			);
			if (withSameName.length > 1) {
				throw new Error(
					`${withSameName.length} commands was found with the same name of ${
						(command.config, name)
					}. All command names must be unique`,
				);
			}
		}
	}

	async setupEventsCollection() {
		const cmdFiles = fs
			.readdirSync(path.join(__dirname, '../', 'events'))
			.filter((item) => item.endsWith('.js') && item !== 'base.js');

		const client = new Redis(redisConfig);

		for (const file of cmdFiles) {
			const resolved: { default: BaseDiscordEvent<'debug'> } = await import(
				path.join(__dirname, '../', 'events', file)
			);

			const event = resolved.default;

			event.queue = this.interactionsQueue;
			event.processorId = file;

			this.events.set(event.config.name, event);

			this.discord.on(event.config.name, async (...args) => {
				const key = `discord:events:${event.config.name}:${hashArray(args)}`;
				// Tenta adquirir o bloqueio

				const getLock = await client.set(key, '1', 'EX', 10, 'NX');

				if (getLock === 'OK') {
					await event.config.handle(
						{
							resolveDependency: (typeOrToken) => {
								return this.moduleRef.resolve(typeOrToken, undefined, {
									strict: false,
								});
							},
						},
						...args,
					);
				} else {
					console.log('Evento já está sendo processado por outra réplica.');
				}

				// this.interactionsQueue.add(
				// 	PROCESS_EVENT_JOB,
				// 	<ProcessEventJob>{
				// 		processorId: event.processorId,
				// 		event: args,
				// 	},
				// 	{ jobId:  },
				// );
			});
		}
	}
}
