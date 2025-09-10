import { ResolveField, Resolver } from '@nestjs/graphql';
import { CreateDebugInteractionResult } from 'src/graphql';

@Resolver('CreateDebugInteractionResult')
export class CreateDebugInteractionResultResolver {
	@ResolveField()
	__resolveType(value: CreateDebugInteractionResult) {
		if ('interactionId' in value) {
			return 'DebugInteractionCreated';
		}

		if ('errorCode' in value) {
			return 'DebugInteractionError';
		}

		return null;
	}
}
