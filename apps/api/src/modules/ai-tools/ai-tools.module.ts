import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { AiToolsController } from './controllers/ai-tools.controller';

@Module({
	imports: [CommonModule],
	controllers: [AiToolsController],
})
export class AiToolsModule {}
