import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { discord_config } from '@prisma/client';
import { Client, EmbedBuilder, GatewayIntentBits, Partials } from 'discord.js';
import { ENV } from 'src/config/env';
import { resolveAssetName } from 'src/shared/utils/resolve-asset-name';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class DiscordBotService extends Client implements OnApplicationBootstrap {
	config: discord_config;
	logger = new Logger(DiscordBotService.name);

	constructor(private readonly prisma: PrismaService) {
		super({
			intents: Object.values(GatewayIntentBits) as GatewayIntentBits[],
			partials: [Partials.Channel],
		});
	}

	async onApplicationBootstrap() {
		process.env.NODE_ENV !== 'testing' && this.setup();
	}

	async setup() {
		this.on('ready', async () => {
			this.logger.log(`Logged in as ${this.user!.tag}`);
		});

		await this.login(ENV.DISCORD.token);

		await this.fetchConfig();

		setInterval(() => this.fetchConfig(), 1000 * 15);
	}

	async fetchConfig() {
		this.config = await this.prisma.discord_config.findFirstOrThrow();
	}

	get defaultEmbed() {
		return new EmbedBuilder()
			.setColor(this.config.messages_color as `#${string}`)
			.setAuthor({
				name: this.config.author_name!,
				iconURL: resolveAssetName(this.config.messages_avatar!),
				url: this.config.author_url!,
			})
			.setTimestamp();
	}
}
