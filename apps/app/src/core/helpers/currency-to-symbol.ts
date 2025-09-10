export const currencyToSymbol = (currency: string) => {
	try {
		const formated = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency,
		}).format(0);

		const chars = formated.split('');

		let result = '';

		chars.forEach((v) => {
			if (isNaN(Number(v)) && v !== '.') result += v;
		});

		return result.trim();
	} catch {
		return '';
	}
};
