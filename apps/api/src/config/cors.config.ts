import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ENV } from './env';

export const corsOptions: CorsOptions = {
	allowedHeaders: ENV.CORS.allowedHeaders,
	credentials: ENV.CORS.credentials,
	exposedHeaders: ENV.CORS.exposedHeaders,
	maxAge: ENV.CORS.maxAge,
	methods: ENV.CORS.methods,
	origin: ENV.CORS.origin,
};
