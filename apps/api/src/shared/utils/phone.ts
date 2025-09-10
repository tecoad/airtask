import { PhoneNumber, PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export const isPhoneValid = (val: string | undefined) => {
	try {
		const number = phoneUtil.parseAndKeepRawInput(val ?? '');

		if (!phoneUtil.isValidNumber(number)) {
			return false;
		}

		return true;
	} catch {
		return false;
	}
};

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
