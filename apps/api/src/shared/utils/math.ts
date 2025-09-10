export const addPercentToValue = (value: number, percent: number) => {
	const percentOnValue = value * (percent / 100);

	return value + percentOnValue;
};

export const removePercentAddedFromValue = (value: number, percent: number) => {
	const percentOnValue = 1 + percent / 100;

	return Math.ceil(value / percentOnValue);
};

export const getPercentFromValue = (value: number, percent: number) => {
	return (value / 100) * percent;
};

export const calculatePercentage = (partialValue: number, totalValue: number): number => {
	const percentage = (partialValue / totalValue) * 100;
	return percentage;
};

export const getPercentBetweenValues = (x: number, y: number) => {
	return (x / y) * 100;
};

export const minAndMaxRandomNumber = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1) + min);
};
