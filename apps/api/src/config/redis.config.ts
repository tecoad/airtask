import { RedisOptions } from 'ioredis';
import { ENV } from './env';

export const redisConfig: RedisOptions = {
	host: ENV.REDIS.host,
	port: ENV.REDIS.port,
	password: ENV.REDIS.password,
	username: ENV.REDIS.user,
};
