/**
 * Trim and lowercase
 */
export const sanitizeEmail = (email: string) => {
	try {
		return email.trim().toLowerCase();
	} catch {
		return email;
	}
};

/**
 * First character to uppercase, rest to lowercase
 */
export const sanitizeName = (name: string) => {
	try {
		const [first, ...rest] = name.trim().toLowerCase().split('');
		return `${first.toUpperCase()}${rest.join('')}`;
	} catch {
		return name;
	}
};
