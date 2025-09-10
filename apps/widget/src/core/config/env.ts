export const ENV = Object.seal({
	baseUrl: process.env.NEXT_PUBLIC_WIDGET_BASE_URL!,
	vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV,
	API: Object.seal({
		graphql_url: process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
		graphql_ws_url: process.env.NEXT_PUBLIC_API_GRAPHQL_WS_URL,
	}),
	SECRETS: Object.seal({
		revalidate_quotation_script_secret: process.env.REVALIDATE_QUOTATION_SCRIPT_SECRET,
	}),
	PUBLIC: Object.seal({
		url: process.env.NEXT_PUBLIC_PUBLIC_DOMAIN,
	}),
	WIDGET: Object.seal({
		assets_url: process.env.NEXT_PUBLIC_WIDGET_ASSETS_URL!,
		widget_script_by_hash: (module: string, hash: string) =>
			process.env.NEXT_PUBLIC_WIDGET_INSTALLATION_URL?.replace('{hash}', hash).replace(
				'{module}',
				module,
			)!,
	}),
});
