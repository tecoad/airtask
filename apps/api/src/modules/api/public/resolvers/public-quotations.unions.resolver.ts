import { ResolveField, Resolver } from '@nestjs/graphql';

@Resolver('PublicQuotationResult')
export class PublicQuotationResultResolver {
	@ResolveField()
	__resolveType(value: any) {
		if ('id' in value) {
			return 'PublicQuotation';
		}

		if ('errorCode' in value) {
			return 'QuotationAvailabilityError';
		}

		return null;
	}
}

@Resolver('InitQuotationConversationResult')
export class InitQuotationConversationResultResolver {
	@ResolveField()
	__resolveType(value: any) {
		if ('token' in value) {
			return 'QuotationConversationMessageToken';
		}

		if ('content' in value) {
			return 'QuotationConversationMessage';
		}

		if ('id' in value) {
			return 'QuotationConversation';
		}

		if ('errorCode' in value) {
			return 'QuotationAvailabilityError';
		}

		return null;
	}
}

@Resolver('QuotationConversationMessageResult')
export class QuotationConversationMessageResultResolver {
	@ResolveField()
	__resolveType(value: any) {
		if ('token' in value) {
			return 'QuotationConversationMessageToken';
		}

		if ('content' in value) {
			return 'QuotationConversationMessage';
		}

		return null;
	}
}

@Resolver('QuotationConversationResult')
export class QuotationConversationResultResolver {
	@ResolveField()
	__resolveType(value: any) {
		if ('id' in value) {
			return 'QuotationConversation';
		}

		if ('errorCode' in value) {
			return 'QuotationAvailabilityError';
		}

		return null;
	}
}

export const publicQuotationUnionsResolvers = [
	PublicQuotationResultResolver,
	QuotationConversationMessageResultResolver,
	InitQuotationConversationResultResolver,
	QuotationConversationResultResolver,
];
