export function unique<T>(arr: T[], byKey?: keyof T): T[] {
	if (byKey == null) {
		return Array.from(new Set(arr));
	} else {
		// Based on https://stackoverflow.com/a/58429784/772859
		/**@ts-ignore */
		return [...new Map(arr.map((item) => [item[byKey], item])).values()];
	}
}
