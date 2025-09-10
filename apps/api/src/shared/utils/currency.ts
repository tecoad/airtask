import { CurrencyCode } from 'src/graphql';

export const formatCurrency = (value: number, currency: CurrencyCode) => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	}).format(value);
};

export const minimalPrice = ({
	value,
	currencyCode,
}: {
	value: number;
	currencyCode: string;
}) => {
	return `${currencyToSymbol(currencyCode)} ${value}`;
};

export const formatPrice = ({
	value,
	currencyCode,
}: {
	value: number;
	currencyCode: string;
}) => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currencyCode,
	}).format(value);
};

export const currencyToSymbol = (currency: string) => {
	try {
		const formatted = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency,
		}).format(0);

		const chars = formatted.split('');

		let result = '';

		chars.forEach((v) => {
			if (isNaN(Number(v)) && v !== '.') result += v;
		});

		return result.trim();
	} catch {
		return '';
	}
};
