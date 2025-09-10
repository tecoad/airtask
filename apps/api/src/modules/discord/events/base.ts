import { Queue } from 'bull';
import { ClientEvents } from 'discord.js';
import { CommandHelpers } from '../commands/base';

type Config<Event extends keyof ClientEvents> = {
	name: Event;
	handle: (helpers: CommandHelpers, ...args: ClientEvents[Event]) => Promise<void> | void;
};

export class BaseDiscordEvent<T extends keyof ClientEvents> {
	queue: Queue;
	processorId: string;
	constructor(public readonly config: Config<T>) {}
}
