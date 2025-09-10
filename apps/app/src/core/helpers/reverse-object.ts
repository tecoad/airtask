export function reverseObject<
	T extends string | number | symbol,
	U extends string | number | symbol,
>(obj: Record<T, U>): Record<U, T> {
	const reversed: Record<U, T> = {} as Record<U, T>;
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			reversed[obj[key]] = key as T;
		}
	}
	return reversed;
}
