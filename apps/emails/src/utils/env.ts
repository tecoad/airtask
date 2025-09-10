const assetsUrl =
	process.env.VERCEL_URL ||
	process.env.EMAILS_ASSETS_DOMAIN ||
	process.env.NEXT_PUBLIC_ASSETS_PREFIX;

export const ENV = {
	baseUrl: assetsUrl ? `https://${assetsUrl}` : '',
};
