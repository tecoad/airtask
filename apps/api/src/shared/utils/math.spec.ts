import {
	addPercentToValue,
	calculatePercentage,
	getPercentBetweenValues,
	getPercentFromValue,
	removePercentAddedFromValue,
} from './math';

describe('Math utils', () => {
	it.each([
		[100, 10, 110],
		[200, 10, 220],
	])('addPercentToValue to value %d percent %d', (value, percent, result) => {
		expect(addPercentToValue(value, percent)).toBe(result);
	});

	it.each([
		[addPercentToValue(100, 10), 10, 100],
		[addPercentToValue(220, 10), 10, 220],
	])(
		'removePercentAddedFromValue with value %d from percent %d',
		(valueWithPercent, percent, result) => {
			expect(removePercentAddedFromValue(valueWithPercent, percent)).toBe(result);
		},
	);

	it.each([
		[30, 100, 30],
		[30, 200, 60],
		[60, 300, 180],
	])('getPercentFromValue %d percent of %d = %d', (percent, value, result) => {
		expect(getPercentFromValue(value, percent)).toBe(result);
	});

	it.each([
		[30, 100, 30],
		[30, 200, 15],
		[50, 200, 25],
	])('getPercentBetweenValues %d and %d = %d', (x, y, result) => {
		expect(getPercentBetweenValues(x, y)).toBe(result);
	});

	it.each([
		[30, 100, 30],
		[30, 200, 15],
		[50, 200, 25],
	])(
		'calculatePercentage %d and %d = %d',
		(partialValue, totalValue, expectedPercentage) => {
			const result = calculatePercentage(partialValue, totalValue);
			expect(result).toBe(expectedPercentage);
		},
	);
});
