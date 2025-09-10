export type ID = string | number;

export enum SubscriptionStatus {
	Trialing = 'trialing',
	Active = 'active',
	Pending = 'pending',
	Cancelled = 'cancelled',
}

export enum AccountRole {
	Owner = 'owner',
	User = 'user',
}

export enum QuotationStatus {
	Archived = 'archived',
	Published = 'published',
}

export type ExtraCreditProductPrice = {
	currency: string;
	price: string;
	external_id: string;
};

export enum QuotationConversationStatus {
	Active = 'active',
	Finished = 'finished',
}

export enum AffiliateComissionStatus {
	Pending = 'pending',
	Paid = 'paid',
}

export enum AffiliateStatus {
	Active = 'active',
	Inactive = 'inactive',
	WaitingApproval = 'waiting_approval',
}

export enum FlowContactImportStatus {
	InProgress = 'in_progress',
	Completed = 'completed',
}

export type FlowContactImportErroredItemsReport = {
	rowNumber: number;
	errors: {
		field: string;
	}[];
};

export enum FlowInteractionStatus {
	NotAnswered = 'not_answered',
	Requested = 'requested',
	Ringing = 'ringing',
	InProgress = 'in_progress',
	Finished = 'finished',
}

export enum AccountCreditTransactionType {
	Credit = 'credit',
	Debit = 'debit',
}

export enum AccountCreditTransactionReason {
	ModuleUsage = 'module_usage',
	PlanCreation = 'plan_creation',
	PlanRenewal = 'plan_renewal',
	PlanChange = 'plan_change',
	PlanCancellation = 'plan_cancellation',

	CreditBuy = 'credit_buy',
}

export type FlowInteractionHistory = {
	message: string;
	role: 'human' | 'ai';
};

export enum SessionStatus {
	Valid = 'valid',
	Invalid = 'invalid',
}
