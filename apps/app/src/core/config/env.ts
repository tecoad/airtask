const env = process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV;

export const ENV = Object.seal({
	env,
	isDev: !env || env === 'development' || env === 'preview',
	isProd: env === 'production',
	isLocal: !env,
	API: Object.seal({
		rest_base_url: process.env.NEXT_PUBLIC_API_REST_BASE_URL,
		graphql_urL: process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
		graphql_ws_url: process.env.NEXT_PUBLIC_API_GRAPHQL_WS_URL,
		admin_graphql_url: process.env.NEXT_PUBLIC_API_ADMIN_GRAPHQL_URL,
		public_graphql_url: process.env.NEXT_PUBLIC_API_PUBLIC_GRAPHQL_URL,
	}),
	USERS: Object.seal({
		jwt_secret: process.env.USERS_JWT_SECRET,
	}),
	PUBLIC: Object.seal({
		url: process.env.NEXT_PUBLIC_PUBLIC_DOMAIN,
	}),
	PLANS: Object.seal({
		is_using_trial: process.env.NEXT_PUBLIC_IS_PLANS_USING_TRIAL === 'true',
	}),
	HELP: Object.seal({
		whatsapp_support_number: process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER,
		support_email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
		mailbox_id: process.env.NEXT_PUBLIC_MAILBOX_HELP_ID,
	}),
	GOOGLE: Object.seal({
		cloud_api_key: process.env.GOOGLE_CLOUD_API_KEY,
	}),
	GTM: Object.seal({
		id: process.env.NEXT_PUBLIC_GTM_ID,
		url: process.env.NEXT_PUBLIC_GTM_URL,
		auth: process.env.NEXT_PUBLIC_GTM_AUTH,
		preview: process.env.NEXT_PUBLIC_GTM_PREVIEW,
	}),
	AFFILIATE: Object.seal({
		url: (alias: string) =>
			process.env.NEXT_PUBLIC_AFFILIATE_URL?.replace('{referrer}', alias)!,
	}),
	WIDGET: Object.seal({
		widget_url_by_hash: (hash: string) =>
			process.env.NEXT_PUBLIC_WIDGET_URL?.replace('{hash}', hash)!,
		widget_script_by_hash: (module: string, hash: string) =>
			process.env.NEXT_PUBLIC_WIDGET_INSTALLATION_URL?.replace(
				'{module}',
				module,
			).replace('{hash}', hash)!,
		widget_preview_by_hash: (module: string, hash: string, url: string) =>
			process.env.NEXT_PUBLIC_WIDGET_PREVIEW_URL?.replace('{module}', module)
				.replace('{hash}', hash)
				.replace('{url}', url)!,
	}),
});
