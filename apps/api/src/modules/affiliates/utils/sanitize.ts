export const sanitizeAlias = (alias: string) => {
	try {
		const formatted = alias.trim().replaceAll(' ', '').toLowerCase();

		return formatted;
	} catch {
		return alias;
	}
};
