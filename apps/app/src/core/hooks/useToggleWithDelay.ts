import { useState } from 'react';
import { Sleep } from '../helpers';

export const useToggleWithDelay = (time = 3000) => {
	const [state, setState] = useState(false);

	const setValue = async (value = true) => {
		setState(value);

		await Sleep(time);
		setState(!value);
	};

	return [state, setValue] as const;
};
