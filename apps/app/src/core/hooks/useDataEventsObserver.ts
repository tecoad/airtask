import { Dispatch, SetStateAction, useEffect } from 'react';
import {
	EntityNameEventOption,
	GlobalEvents,
	useGlobalEvents,
} from '../contexts/global-events';

export const useDataEventsObserver = <D extends EntityNameEventOption>(
	type: D,
	setData: Dispatch<
		SetStateAction<
			| Array<
					(GlobalEvents['entityCreated'] & {
						name: D;
					})['data']
			  >
			| undefined
		>
	>,
) => {
	const { subscribe } = useGlobalEvents();
	useEffect(() => {
		const listeners: (() => void)[] = [];

		listeners.push(
			subscribe('entityCreated', ({ data, name }) => {
				if (name === type) {
					setData((prev) => [...(prev || []), data] as any);
				}
			}),
			subscribe('entityUpdated', ({ data, name }) => {
				if (name === type) {
					setData(
						(prev) =>
							(prev || []).map((item) => (item.id === data.id ? data : item)) as any,
					);
				}
			}),
			subscribe('entityDeleted', ({ id, name }) => {
				console.log(name, type);
				if (name === type) {
					setData((prev) => (prev || []).filter((item) => item.id !== id) as any);
				}
			}),
		);

		return () => {
			listeners.forEach((listener) => listener());
		};
	}, [setData]);
};
