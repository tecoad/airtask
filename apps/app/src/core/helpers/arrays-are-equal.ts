export const arraysEqual = (a: number[], b: number[]) => {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;

	const cloneA = [...a];
	const cloneB = [...b];

	cloneA.sort((c, d) => c - d);
	cloneB.sort((c, d) => c - d);

	// If you don't care about the order of the elements inside
	// the array, you should sort both arrays here.
	// Please note that calling sort on an array will modify that array.
	// you might want to clone your array first.

	for (var i = 0; i < cloneA.length; ++i) {
		if (cloneA[i] !== cloneB[i]) return false;
	}
	return true;
};
