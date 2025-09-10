import { Injectable, NestMiddleware } from '@nestjs/common';
import * as cors from 'cors';
import { corsOptions } from 'src/config/cors.config';
import { publicApolloDriverConfig } from 'src/config/public-apollo-driver.config';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
	use(req: any, res: any, next: () => void) {
		const options = {
			...corsOptions,
		};

		//
		if (req.path.startsWith(publicApolloDriverConfig.path)) {
			options.origin = '*';
		}

		cors(options)(req, res, next);
	}
}
