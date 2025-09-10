// async-filter.test.ts
import { Sleep } from './any';
import { asyncFilter } from './async-filter';

describe('asyncFilter', () => {
	it('should correctly filter an array with an async function', async () => {
		const numbers = [1, 2, 3, 4, 5];

		const result = await asyncFilter(numbers, async (v) => {
			await Sleep(10);

			return v > 2;
		});

		expect(result).toEqual([3, 4, 5]);
	});

	it('should return an empty array if input array is empty', async () => {
		const empty = [];

		const result = await asyncFilter(empty, async (v) => {
			await Sleep(10);

			return v > 2;
		});

		expect(result).toEqual([]);
	});
});
