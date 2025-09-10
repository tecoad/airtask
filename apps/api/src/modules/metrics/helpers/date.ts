import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import * as moment from 'moment-timezone';

export const brasilTodayAtMidnightForJob = () => {
	const now = moment.tz('America/Sao_Paulo');

	// Se a hora atual for maior ou igual a 23:00, retorna a meia-noite do dia atual
	if (now.hours() >= 23) {
		return now.startOf('day').toDate();
	}

	// Caso contrário, retorna a meia-noite do dia anterior
	const yesterday = now.subtract(1, 'day').startOf('day');
	return yesterday.toDate();
};

export const brasilNextDayAtMidnightForJob = () => {
	const now = moment.tz('America/Sao_Paulo');

	// Se a hora atual for maior ou igual a 23:00, retorna a meia-noite do próximo dia
	if (now.hours() >= 23) {
		const tomorrow = now.add(1, 'day').startOf('day');
		return tomorrow.toDate();
	}

	// Caso contrário, retorna a meia-noite do dia atual
	return now.startOf('day').toDate();
};

export const midnightMetricsJobPeriod = () => {
	return {
		from: brasilTodayAtMidnightForJob(),
		to: brasilNextDayAtMidnightForJob(),
	};
};

export const brasilTodayAtMidnight = () => {
	const today = moment.tz('America/Sao_Paulo').startOf('day');
	return today.toDate();
};

export const brasilNextDayAtMidnight = () => {
	const tomorrow = moment.tz('America/Sao_Paulo').add(1, 'day').startOf('day');
	return tomorrow.toDate();
};

export const todayAtMidnight = () => {
	const today = moment().startOf('day');
	return today.toDate();
};

export const nextDayAtMidnight = () => {
	const tomorrow = moment().add(1, 'day').startOf('day');
	return tomorrow.toDate();
};

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

export const parseDateFromPtBr = (dateString: string): Date => {
	const parts = dateString.split('/');
	const day = parseInt(parts[0], 10);
	// Remember that months are zero-indexed in JavaScript
	const month = parseInt(parts[1], 10) - 1;
	const year = parseInt(parts[2], 10);

	return new Date(year, month, day);
};
