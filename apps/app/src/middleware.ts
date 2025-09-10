import { middlewareRoutes } from '@/lib/common/auth-middleware';
import { locales } from '@/translations';
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const i18nMiddleware = createMiddleware({
	// A list of all locales that are supported
	locales: locales,
	localePrefix: 'never',

	// If this locale is matched, pathnames work without a prefix (e.g. `/about`)
	defaultLocale: 'en',
});

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
	],
};

export async function middleware(req: NextRequest) {
	const auth = await authMiddleware(req);

	if (auth) return auth;

	return i18nMiddleware(req);
}

async function authMiddleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	if (pathname.includes('.')) return;

	for (const route of middlewareRoutes) {
		const currentRouteIsRequested =
			'extractRoute' in route
				? route.extractRoute(req)
				: route.exact
				? pathname === route.path
				: pathname.startsWith(route.path);

		if (currentRouteIsRequested) {
			const token = route.extractTokenFromRequest(req);

			if (route.protected) {
				const redirectTo =
					typeof route.redirectTo === 'string' ? route.redirectTo : route.redirectTo(req);
				const unAuthenticated = () => NextResponse.redirect(new URL(redirectTo, req.url));

				// Recipient auth
				if (token) {
					try {
						await route.verifyAuth(token);

						return;
					} catch (e) {
						return unAuthenticated();
					}
				} else {
					return unAuthenticated();
				}
			} else {
				if (token) {
					try {
						await route.verifyAuth(token);
						if (route.redirectIfLogged) {
							// Redirect if user is already logged in
							return NextResponse.redirect(new URL(route.redirectIfLogged, req.url));
						}
					} catch (e) {
						/** */
					}
				}
			}
		}
	}
}
