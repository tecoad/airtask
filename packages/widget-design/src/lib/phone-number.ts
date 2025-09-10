import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import { formatNumber } from '../components/user-identifier/hooks';

const phoneUtil = PhoneNumberUtil.getInstance();

export const isPhoneValid = (val: string | undefined, country: string) => {
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
