import { CONSTANTS, COOKIE_CONFIG } from '@airtask/core/src/config';
import { NextRequest, NextResponse } from 'next/server';

export const updateUserGeoLocation = (req: NextRequest, res: NextResponse) => {
	const mayCookie = (name: string) => {
		const cookie = req.cookies.get(name);

		return typeof cookie === 'string' ? cookie : cookie?.value;
	};

	if (
		req.geo &&
		(!mayCookie(CONSTANTS.COOKIES.city) ||
			!mayCookie(CONSTANTS.COOKIES.country) ||
			!mayCookie(CONSTANTS.COOKIES.region))
	) {
		res.cookies.set(CONSTANTS.COOKIES.city, req.geo.city!, COOKIE_CONFIG);
		res.cookies.set(CONSTANTS.COOKIES.country, req.geo.country!, COOKIE_CONFIG);
		res.cookies.set(CONSTANTS.COOKIES.region, req.geo.region!, COOKIE_CONFIG);
	}
};
