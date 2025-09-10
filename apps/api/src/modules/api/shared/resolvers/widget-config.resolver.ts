import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { widget_config } from '@prisma/client';
import { PrismaService } from 'src/modules/common/services/prisma.service';

@Resolver('WidgetConfig')
export class WidgetConfigResolver {
	constructor(private readonly prisma: PrismaService) {}

	@ResolveField('icon')
	asset(@Parent() quotationConfig: widget_config) {
		return (
			quotationConfig.icon &&
			this.prisma.directus_files.findUnique({
				where: { id: quotationConfig.icon },
			})
		);
	}

	@ResolveField('avatar')
	avatar(@Parent() quotationConfig: widget_config) {
		return (
			quotationConfig.avatar &&
			this.prisma.directus_files.findUnique({
				where: { id: quotationConfig.avatar },
			})
		);
	}
}
