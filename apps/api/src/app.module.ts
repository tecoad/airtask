import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import * as redisStore from 'cache-manager-redis-store';
import { graphqlUploadExpress } from 'graphql-upload';
import { RedisOptions } from 'ioredis';
import RedisInMemory from 'redis-memory-server';
import { AppController } from './app.controller';
import { adminApolloDriverConfig } from './config/admin-apollo-driver.config';
import { ENV } from './config/env';
import { privateApolloDriverConfig } from './config/private-apollo-driver.config';
import { publicApolloDriverConfig } from './config/public-apollo-driver.config';
import { redisConfig } from './config/redis.config';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AdminModule } from './modules/admin/admin.module';
import { AffiliatesModule } from './modules/affiliates/affiliates.module';
import { AiToolsModule } from './modules/ai-tools/ai-tools.module';
import { ApiModule } from './modules/api/api.module';
import { AssetsModule } from './modules/assets/assets.module';
import { CommonModule } from './modules/common/common.module';
import { DiscordModule } from './modules/discord/discord.module';
import { FlowsModule } from './modules/flows/flows.module';
import { KnowledgebaseModule } from './modules/knowledgebase/knowledgebase.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { SupportModule } from './modules/support/support.module';
import { UsersModule } from './modules/users/users.module';
import { PermissionsGuard } from './shared/guards/permissions.guard';

let forTestingRedis: RedisInMemory;
export const getForTestingRedis = () => forTestingRedis;

@Module({
	imports: [
		CommonModule,
		BullModule.forRootAsync({
			async useFactory() {
				if (ENV.BULL_BOARD.force_local_queue_instance || ENV.isTesting) {
					forTestingRedis = new RedisInMemory();
					return {
						redis: {
							host: await forTestingRedis.getHost(),
							port: await forTestingRedis.getPort(),
						},
					};
				}
				return {
					redis: redisConfig,
				};
			},
		}),
		CacheModule.register<RedisOptions>({
			store: redisStore,
			isGlobal: true,
			...redisConfig,
		}),
		ScheduleModule.forRoot(),
		ApiModule,
		DiscordModule,
		SubscriptionsModule,
		UsersModule,
		AccountsModule,
		QuotationsModule,
		AssetsModule,
		SupportModule,
		MetricsModule,
		AffiliatesModule,
		AdminModule,
		AiToolsModule,
		FlowsModule,
		KnowledgebaseModule,
	],
	controllers: [AppController],
	providers: [
		{
			provide: APP_GUARD,
			useClass: PermissionsGuard,
		},
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }))
			.forRoutes(publicApolloDriverConfig.path!);

		consumer
			.apply(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }))
			.forRoutes(privateApolloDriverConfig.path!);
		consumer
			.apply(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }))
			.forRoutes(adminApolloDriverConfig.path!);
	}
}
