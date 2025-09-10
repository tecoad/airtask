import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ENV } from 'src/config/env';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';

@Module({
	imports: [
		HttpModule.register({
			baseURL: `${ENV.HELPSCOUT.url}${ENV.HELPSCOUT.url?.endsWith('/') ? '' : '/'}`,
		}),
	],
	controllers: [SupportController],
	providers: [SupportService],
})
export class SupportModule {}
