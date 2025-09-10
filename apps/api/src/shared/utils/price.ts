import { CurrencyCode } from 'src/graphql';

export const formatPrice = ({
	value,
	currencyCode,
}: {
	value: number;
	currencyCode: CurrencyCode;
}) => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currencyCode,
	}).format(value);
};
