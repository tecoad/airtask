import { ResolveField, Resolver } from '@nestjs/graphql';
import {
	FlowCalendarIntegrationSettings,
	FlowCalendarIntegrationType,
} from 'src/graphql';

@Resolver('FlowCalendarIntegrationSettings')
export class FlowCalendarIntegrationSettingsResolver {
	@ResolveField()
	__resolveType(value: FlowCalendarIntegrationSettings) {
		const n = (p: string) => `FlowCalendarIntegrationSettings_${p}`;

		switch (value.type) {
			case FlowCalendarIntegrationType.savvycall:
				return n('SavvyCal');
		}

		return null;
	}
}
