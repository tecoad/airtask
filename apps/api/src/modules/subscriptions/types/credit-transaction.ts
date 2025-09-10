import { AccountUsageKind } from 'src/graphql';
import { AccountCreditTransactionReason } from 'src/shared/types/db';

export type CreditTransactionReasonMetadata = {
	[AccountCreditTransactionReason.ModuleUsage]: {
		module: AccountUsageKind;
	};
};
