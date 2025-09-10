import { parseCookies } from 'nookies';
import { useEffect, useState } from 'react';

export const useParseCookieValue = (key: string) => {
	const [value, setValue] = useState<string | null>(null);

	useEffect(() => {
		const cookies = parseCookies();

		if (cookies[key]) {
			setValue(cookies[key]);
		}
	}, []);

	return value;
};
