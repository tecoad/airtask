import { setHours, setMinutes } from 'date-fns';
import { remainingDayFraction } from './time';

describe('Time helpers', () => {
	it.each<[FakeTimersConfig, number]>([
		[{ now: setMinutes(setHours(new Date(), 0), 0) }, 1],
		[{ now: setMinutes(setHours(new Date(), 12), 0) }, 0.5],
	])('remainingDayFraction works', (fakeConfig, result) => {
		jest.useFakeTimers(fakeConfig);
		const fraction = remainingDayFraction();

		expect(fraction).toBe(result);
	});
});
