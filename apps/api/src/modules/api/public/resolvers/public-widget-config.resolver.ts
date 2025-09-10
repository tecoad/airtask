import { Args, Query, Resolver } from '@nestjs/graphql';
import { WidgetConfigService } from 'src/modules/quotations/services/widget-config.service';
import { ID } from 'src/shared/types/db';

@Resolver()
export class PublicWidgetConfigResolver {
	constructor(private readonly widgetConfigService: WidgetConfigService) {}

	@Query()
	quotationWidgetSettings(@Args('hash') hash: string, @Args('id') id: ID) {
		return this.widgetConfigService.findForQuotationHashOrId(hash, id);
	}
}
