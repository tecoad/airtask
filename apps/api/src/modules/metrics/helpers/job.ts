import { brasilTodayAtMidnight } from './date';

export const dailyMetricUniqueId = (name: string) => {
	const date = brasilTodayAtMidnight();
	return `${name}-${date.toLocaleDateString('pt-br')}`;
};
