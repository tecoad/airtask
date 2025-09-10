import { Module, forwardRef } from '@nestjs/common';
import { AssetsModule } from 'src/modules/assets/assets.module';
import { CommonModule } from 'src/modules/common/common.module';
import { QuotationsModule } from 'src/modules/quotations/quotations.module';
import { AssetsResolver } from './resolvers/assets.resolver';
import { QuotationConversationResolver } from './resolvers/quotation-conversation.resolver';
import { WidgetConfigResolver } from './resolvers/widget-config.resolver';

const resolvers = [AssetsResolver, WidgetConfigResolver, QuotationConversationResolver];

@Module({
	imports: [forwardRef(() => CommonModule), AssetsModule, QuotationsModule],
	providers: [...resolvers],
})
export class SharedApiModule {}
