import { Module, forwardRef } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { KnowledgeBaseQAService } from './services/knowledge-base-qa.service';
import { KnowledgeBaseService } from './services/knowledge-base.service';

const providersAndExports = [KnowledgeBaseService, KnowledgeBaseQAService];

@Module({
	imports: [forwardRef(() => CommonModule)],
	providers: [...providersAndExports],
	exports: [...providersAndExports],
})
export class KnowledgebaseModule {}
