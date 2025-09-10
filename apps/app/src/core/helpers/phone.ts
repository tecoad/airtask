import { PhoneNumber, PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export function formatNumber(
	phoneNumber: PhoneNumber | string,
	format: PhoneNumberFormat,
	country?: string,
) {
	try {
		const number =
			phoneNumber instanceof PhoneNumber
				? phoneNumber
				: phoneUtil.parseAndKeepRawInput(phoneNumber, country);
		const formatted = phoneUtil.format(number, format);

		return formatted;
	} catch {
		return phoneNumber as string;
	}
}
