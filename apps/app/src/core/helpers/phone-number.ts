import { PhoneNumber, PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import { useEffect } from 'react';

const phoneUtil = PhoneNumberUtil.getInstance();

export function formatToE164(phoneNumber: string, countryCode: string) {
	const number = phoneUtil.parse(phoneNumber, countryCode);
	return phoneUtil.format(number, PhoneNumberFormat.E164);
}

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

export const usePhoneNumber = ({
	phone,
	setPhone,
}: {
	phone: string;
	setPhone: (value: string) => void;
}) => {
	useEffect(() => {
		let value = phone;

		if (!value) {
			return;
		}

		if (!value.startsWith('+')) {
			value = `+${value}`;
		}

		// try see the number is valid
		try {
			const number = phoneUtil.parse(value);

			setPhone(formatNumber(number, PhoneNumberFormat.INTERNATIONAL));
		} catch {}
	}, [phone]);
};

export const isPhoneValid = (val: string | undefined, country?: string) => {
	try {
		const formatted = formatNumber(val as any, PhoneNumberFormat.E164, country);

		const number = phoneUtil.parseAndKeepRawInput(formatted ?? '');

		if (!phoneUtil.isValidNumber(number)) {
			return false;
		}

		return true;
	} catch {
		return false;
	}
};
