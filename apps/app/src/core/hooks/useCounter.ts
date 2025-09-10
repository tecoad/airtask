import { useEffect, useState } from 'react';

export const useCounter = ({
	initialValue,
	mode,
	interval = 1000,
	goalValue,
	onGoalValue,
}: {
	initialValue: number;
	goalValue: number;
	onGoalValue?: () => Promise<void> | void;
	mode: 'decrease' | 'increase';
	interval?: number;
}) => {
	const [state, setState] = useState(initialValue);

	useEffect(() => {
		const intervalId = setInterval(() => {
			setState((prev) => {
				const passedGoal = prev === goalValue;

				if (passedGoal) {
					return prev;
				}

				const newState = mode === 'increase' ? prev + 1 : prev - 1;

				newState === goalValue && onGoalValue?.();

				return newState;
			});
		}, interval);

		return () => clearInterval(intervalId);
	}, []);

	return state;
};
