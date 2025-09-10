import { INestApplication, ModuleMetadata, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { validationPipeOptions } from 'src/config/validation-pipe.config';

export const mockApp = async (metadata?: ModuleMetadata): Promise<INestApplication> => {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		...metadata,
		imports: [AppModule, ...(metadata?.imports ?? [])],
	}).compile();
	const app = moduleFixture.createNestApplication();

	app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
	await app.init();
	await app.listen(0);

	return app;
};
