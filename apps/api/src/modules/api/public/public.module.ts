import { Module } from '@nestjs/common';
import { CommonModule } from 'src/modules/common/common.module';
import { QuotationsModule } from 'src/modules/quotations/quotations.module';
import { PublicQuotationsResolver } from './resolvers/public-quotations.resolver';
import { publicQuotationUnionsResolvers } from './resolvers/public-quotations.unions.resolver';
import { PublicWidgetConfigResolver } from './resolvers/public-widget-config.resolver';

const resolvers = [
	PublicQuotationsResolver,
	...publicQuotationUnionsResolvers,

	PublicWidgetConfigResolver,
];

@Module({
	imports: [QuotationsModule, CommonModule],
	providers: [...resolvers],
})
export class PublicApiModule {}
