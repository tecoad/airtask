'use client';

import {
	PhoneNumber,
	PhoneNumberFormat,
	PhoneNumberType,
	PhoneNumberUtil,
} from 'google-libphonenumber';
import { useEffect, useMemo } from 'react';

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

export const usePhoneNumber = ({
	phone,
	country,
	setCountry,
	setPhone,
}: {
	phone: string;
	setPhone?: (value: string) => void;
	country?: string;
	setCountry?: (value?: string) => void;
}) => {
	// Format phone number on change country
	useEffect(() => {
		const formatted = formatNumber(phone ?? '', PhoneNumberFormat.E164, country!);

		setPhone?.(formatted);
	}, [country]);

	// Get country from phone number if not set
	useEffect(() => {
		try {
			if (!country) {
				const number = phoneUtil.parseAndKeepRawInput(phone ?? '');

				const newCountry = phoneUtil.getRegionCodeForNumber(number);

				newCountry && setCountry?.(newCountry);

				setPhone?.(formatNumber(phone ?? '', PhoneNumberFormat.E164, newCountry));
			}
		} catch {
			/** */
		}
	}, [phone]);

	const whatsappNumberFormatted = useMemo(() => {
		return formatNumber(phone ?? '', PhoneNumberFormat.NATIONAL, country!);
	}, [country, phone]);

	const exampleNumberByCountry = useMemo(() => {
		const example = phoneUtil.getExampleNumberForType(country!, PhoneNumberType.MOBILE);

		const formatted = formatNumber(example, PhoneNumberFormat.NATIONAL, country!);

		if (typeof formatted !== 'string') return undefined;

		// All digits to 9
		const replaced = formatted.replace(/[0-9]/g, '9');

		return replaced;
	}, [country]);

	return {
		whatsappNumberFormatted,
		exampleNumberByCountry,
	};
};
