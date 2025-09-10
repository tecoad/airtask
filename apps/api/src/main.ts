import * as requestIp from 'request-ip';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import * as cookieParser from 'cookie-parser';
import { Request } from 'express';
import { AppModule } from './app.module';
import { setupBullBoard } from './config/bull-board.config';
import { corsOptions } from './config/cors.config';
import { ENV } from './config/env';
import { publicApolloDriverConfig } from './config/public-apollo-driver.config';
import { validationPipeOptions } from './config/validation-pipe.config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		rawBody: true,
	});

	// registrar o manipulador de eventos uncaughtException
	process.on('uncaughtException', (err) => {
		Logger.error('Top-level error not handled');
		console.log(err);
	});

	// registrar o manipulador de eventos unhandledRejection
	process.on('unhandledRejection', (reason) => {
		Logger.error('Top-level promise error not handled', reason);
		console.log(reason);
	});

	app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
	app.useWebSocketAdapter(new WsAdapter(app));

	app.use(requestIp.mw());

	app.use(cookieParser());
	app.enableCors((req: Request, cb) => {
		const options = {
			...corsOptions,
		};

		if (req.url === publicApolloDriverConfig.path) {
			options.origin = true;
		}

		cb(null as any, options);
	});

	setupBullBoard(app);

	await app.listen(ENV.PORT || 3000);
}
bootstrap();
