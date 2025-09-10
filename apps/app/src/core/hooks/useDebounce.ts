import { useEffect, useState } from 'react';

export const useDebounce = <D>(
	initialValue: D,
	onChange?: (value: D) => void | Promise<void>,
	delay = 300,
) => {
	const [state, setState] = useState<D>(initialValue);

	useEffect(() => {
		const timeout = setTimeout(() => {
			onChange?.(state);
		}, delay);

		return () => {
			clearTimeout(timeout);
		};
	}, [state]);

	return [state, setState] as const;
};
