import { config } from 'dotenv';
import {
	makeSureStringEndsWithSlash,
	makeSureStringNotStartsWithSlash,
} from '../shared/utils/url';
config();

export const ENV = Object.seal({
	isProd: process.env.NODE_ENV === 'production',
	isTesting: process.env.NODE_ENV === 'testing',
	PORT: process.env.PORT,
	COOKIES: Object.seal({
		domain: process.env.COOKIES_DOMAIN,
	}),
	WIDGET: Object.seal({
		revalidate_quotation_script: (hash: string) =>
			process.env.WIDGET_REVALIDATE_QUOTATION_SCRIPT!.replace('{hash}', hash),
		revalidate_account_script_secret:
			process.env.WIDGET_REVALIDATE_QUOTATION_SCRIPT_SECRET,
	}),
	POSTMARK: Object.seal({
		api_token: process.env.POSTMARK_API_TOKEN,
		sandbox_api_token: process.env.POSTMARK_SANDBOX_API_TOKEN,
	}),
	DISCORD: Object.seal({
		token: process.env.DISCORD_BOT_TOKEN,
		commands_prefix: process.env.DISCORD_BOT_PREFIX || '!',
	}),
	HELPSCOUT: Object.seal({
		url: process.env.HELPSCOUT_API_URL,
		app_id: process.env.HELPSCOUT_APP_ID,
		app_secret: process.env.HELPSCOUT_APP_SECRET,
	}),
	FLOW_CALLER: Object.seal({
		url: process.env.FLOW_CALLER_URL,
	}),
	TWILIO: Object.seal({
		flow_calls_webhooks_url: (path: string) =>
			makeSureStringEndsWithSlash(process.env.FLOW_CALLS_WEBHOOKS_TWILIO_URL!) +
			makeSureStringNotStartsWithSlash(path),
		outbound_calls_number: process.env.TWILIO_OUTBOUND_CALLS_NUMBER,
		auth_token: process.env.TWILIO_AUTH_TOKEN,
		account_sid: process.env.TWILIO_ACCOUNT_SID,
	}),
	LANGSMITH: Object.seal({
		api_url: process.env.LANGSMITH_ENDPOINT,
		api_key: process.env.LANGSMITH_API_KEY,
		project_name: (suffix: string) => `${suffix}-${ENV.isProd ? 'prod' : 'dev'}`,
		repo_name: (suffix: string, hideEnvPrefix = false) =>
			`airtask/${suffix}${hideEnvPrefix ? '' : `-${ENV.isProd ? 'prod' : 'dev'}`}`,
	}),
	REDIRECTS: Object.seal({
		app_url: process.env.REDIRECT_APP!,
		redirect_after_subscription_checkout:
			process.env.REDIRECT_AFTER_SUBSCRIPTION_CHECKOUT,
		reset_password_action_link: (token: string) =>
			process.env.RESET_PASSWORD_ACTION_LINK!.replace('{token}', token),
		verify_email_action_link: (token: string, id: number) =>
			process.env
				.VERIFY_EMAIL_ACTION_LINK!.replace('{token}', token)
				.replace('{id}', id.toString()),
	}),
	EMAIL: Object.seal({
		from: process.env.EMAIL_FROM,
	}),
	BACKOFFICE: Object.seal({
		username: process.env.BACKOFFICE_USERNAME,
		password: process.env.BACKOFFICE_PASSWORD,
	}),
	QUOTATION: Object.seal({
		ai_verbose_mode: process.env.QUOTATION_AI_DEBUG_MODE === 'true',
	}),
	PLANS: Object.seal({
		trial_days: Number(process.env.PLANS_TRIAL_DAYS || 0),
	}),
	AFFILIATE: Object.seal({
		controller_token: process.env.AFFILIATE_CONTROLLER_TOKEN,
	}),
	CORS: Object.seal({
		origin: process.env.CORS_ORIGIN?.split(','),
		methods: process.env.CORS_METHODS?.split(','),
		allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(','),
		exposedHeaders: [
			...(process.env.CORS_EXPOSED_HEADERS?.split(',') || []),
			process.env.USERS_TOKEN_HEADER!,
		],
		credentials: process.env.CORS_CREDENTIALS === 'true',
		maxAge: Number(process.env.CORS_MAX_AGE),
	}),
	ADMIN: Object.seal({
		users_ids_with_super_admin: process.env.USERS_IDS_WITH_SUPER_ADMIN?.split(','),
	}),
	USERS: Object.seal({
		jwt_token_secret: process.env.USERS_JWT_TOKEN_SECRET,
		token_header: process.env.USERS_TOKEN_HEADER,
	}),
	OPENAI: Object.seal({
		api_key: process.env.OPENAI_API_KEY,
		use_prompt_layer: process.env.OPENAI_USE_PROMPT_LAYER === 'true',
	}),
	GTM: Object.seal({
		url: process.env.GTM_URL,
		server_preview: process.env.GTM_SERVER_PREVIEW,
		use_server_preview: process.env.GTM_USE_SERVER_PREVIEW === 'true',
	}),
	REDIS: Object.seal({
		host: process.env.REDIS_HOST,
		password: process.env.REDIS_PASSWORD,
		port: Number(process.env.REDIS_PORT),
		user: process.env.REDIS_USER,
		db: process.env.REDIS_DB,
	}),
	BULL_BOARD: Object.seal({
		user: process.env.BULL_BOARD_USER,
		password: process.env.BULL_BOARD_PASSWORD,
		force_local_queue_instance:
			process.env.BULL_BOARD_FORCE_LOCAL_QUEUE_INSTANCE === 'true',
	}),
	PINECONE: Object.seal({
		environment: process.env.PINECONE_ENVIRONMENT,
		api_key: process.env.PINECONE_API_KEY,
		questions_training_index_name: process.env.PINECONE_QUESTIONS_TRAINING_INDEX_NAME,
	}),
	STRIPE: Object.seal({
		api_key: process.env.STRIPE_API_KEY,
		webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
		entity_url: (entityPlural: string, id: string) =>
			`https://dashboard.stripe.com/${ENV.isProd ? '' : 'test/'}${entityPlural}/${id}`,
	}),
	DIRECTUS: Object.seal({
		url: process.env.DIRECTUS_URL,
		staticToken: process.env.DIRECTUS_STATIC_TOKEN,
	}),
});
