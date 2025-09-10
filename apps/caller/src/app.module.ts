import { redisConfig } from '@airtask/api/dist/config/redis.config';
import { CacheModule } from '@nestjs/cache-manager';
import { Module, forwardRef } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { RedisOptions } from 'ioredis';
import { CallsModule } from './modules/calls/calls.module';
import { CommonModule } from './modules/common/common.module';

@Module({
  imports: [
    forwardRef(() => CommonModule),
    CallsModule,
    CacheModule.register<RedisOptions>({
      store: redisStore,
      isGlobal: true,
      ...redisConfig,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
