export function remainingDayFraction() {
	const now = new Date();
	const hours = now.getHours();
	const minutes = now.getMinutes();
	// Convert current time to minutes
	const currentTimeInMinutes = hours * 60 + minutes;
	// Total minutes in a day
	const totalMinutesInDay = 24 * 60;
	// Calculate the remaining fraction of the day
	const remainingFraction = 1 - currentTimeInMinutes / totalMinutesInDay;
	return remainingFraction;
}
