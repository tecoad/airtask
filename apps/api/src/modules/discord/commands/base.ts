import { Type } from '@nestjs/common';
import { Queue } from 'bull';
import { Message, PermissionResolvable } from 'discord.js';

export type CommandHelpers = {
	resolveDependency<TInput = any, TResult = TInput>(
		typeOrToken: Type<TInput> | string | symbol,
	): Promise<TResult>;
};

export class BaseDiscordCommand {
	queue: Queue;

	constructor(
		public readonly config: {
			name: string;
			description: string;
			deleteInput?: boolean;
			permissions?: PermissionResolvable[];
			/**
			 * User has to be all the permissions in the list or just one
			 * @default one
			 */
			permissionsMode?: 'all' | 'one';

			execute: (
				message: Message,
				args: string[],
				helpers: CommandHelpers,
			) => Promise<void> | void;
		},
	) {}
}
