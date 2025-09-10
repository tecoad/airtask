export type StripeSubscriptionMetaData = {
	accountId: string;
};

export type StripeExtraCreditsCheckoutMetaData = {
	accountId: string;
	kind: 'extra-credits-purchase';
};
export type StripeSubscriptionCheckoutMetadata = {
	kind: 'subscription-purchase';
};
// On future adds, increase this
export type StripeCheckoutMetaData =
	| StripeSubscriptionCheckoutMetadata
	| StripeExtraCreditsCheckoutMetaData;

export enum ExtraCreditStatus {
	Available = 'available',
	Used = 'used',
}
