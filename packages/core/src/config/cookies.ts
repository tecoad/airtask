const domain =
	process.env.NEXT_PUBLIC_COOKIE_DOMAIN || process.env.REACT_APP_COOKIE_DOMAIN;

export const COOKIE_CONFIG = {
	domain,
	path: '/',
	expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
};

if (!domain && typeof window !== 'undefined') {
	console.warn('WARNING: cookieDomain is not set');
}
