export type AsyncFunction<T, U> = (item: T) => Promise<U>;

export async function asyncMap<T, U>(arr: T[], func: AsyncFunction<T, U>): Promise<U[]> {
	const result: U[] = [];
	for (const item of arr) {
		result.push(await func(item));
	}
	return result;
}
