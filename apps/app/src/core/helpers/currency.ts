export const formatCurrency = (currency: string, value: number | bigint) => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
	}).format(value);
};

export const formatPrice = (currency: string, value: number) => {
	return `${formatCurrency(currency, value)}`;
};
