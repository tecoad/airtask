import { ResolveField, Resolver } from '@nestjs/graphql';
import { AffiliateSettingsResult } from 'src/graphql';

@Resolver('AffiliateSettingsResult')
export class AffiliateSettingsResultResolver {
	@ResolveField()
	__resolveType(value: AffiliateSettingsResult) {
		if ('id' in value) {
			return 'Affiliate';
		}

		if ('errorCode' in value) {
			return 'AffiliateSettingsResultError';
		}

		return null;
	}
}

export const affiliateUnionsResolvers = [AffiliateSettingsResultResolver];
