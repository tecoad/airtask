export async function asyncFilter<T>(
	array: T[],
	filterCallback: (item: T) => Promise<boolean>,
): Promise<T[]> {
	const results = await Promise.all(
		array.map(async (item) => {
			if (await filterCallback(item)) {
				return item;
			}
		}),
	);

	return results.filter(Boolean) as T[];
}
