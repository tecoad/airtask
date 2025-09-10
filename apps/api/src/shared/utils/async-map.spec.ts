import { AsyncFunction, asyncMap } from './async-map';

describe('asyncMap', () => {
	it('should correctly map an array with an async function', async () => {
		const numbers = [1, 2, 3, 4, 5];
		const doubleAsync: AsyncFunction<number, number> = async (num) => num * 2;

		const result = await asyncMap(numbers, doubleAsync);
		expect(result).toEqual([2, 4, 6, 8, 10]);
	});

	it('should return an empty array if input array is empty', async () => {
		const emptyArray: number[] = [];
		const doubleAsync: AsyncFunction<number, number> = async (num) => num * 2;

		const result = await asyncMap(emptyArray, doubleAsync);
		expect(result).toEqual([]);
	});
});
