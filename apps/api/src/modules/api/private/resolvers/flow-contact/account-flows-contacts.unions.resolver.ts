import { ResolveField, Resolver } from '@nestjs/graphql';
import { ImportFlowContactsFromCsvResult } from 'src/graphql';

@Resolver('ImportFlowContactsFromCsvResult')
export class ImportFlowContactsFromCsvResultResolver {
	@ResolveField()
	__resolveType(value: ImportFlowContactsFromCsvResult) {
		if ('errorCode' in value) return 'ImportFlowContactsError';
		if ('queued_items' in value) return 'ImportFlowContactsQueued';

		return null;
	}
}

export const accountFlowsContactsUnionsResolvers = [
	ImportFlowContactsFromCsvResultResolver,
];
