import { endOfMonth, startOfMonth, subMonths } from 'date-fns';

export const firstDayOfLastMonth = () => {
	const currentDate = new Date();
	const firstDayLastMonth = startOfMonth(subMonths(currentDate, 1));
	return firstDayLastMonth;
};

export const lastDayOfLastMonth = () => {
	const currentDate = new Date();
	const lastDayLastMonth = endOfMonth(subMonths(currentDate, 1));
	return lastDayLastMonth;
};
