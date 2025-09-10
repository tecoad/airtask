'use client';
import { useEffect, useReducer } from 'react';

export const useReRender = (timeout = 60000) => {
	const [_, forceRender] = useReducer((state) => state + 1, 0);

	useEffect(() => {
		const timer = setInterval(() => {
			forceRender();
		}, timeout);

		return () => clearInterval(timer);
	}, []);
};
