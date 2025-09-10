import { widgetLanguagesData } from '@airtask/widget-design/dist/i18n/languages-data';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
	const messages = {
		...(await import(`./translations/${locale}.json`)).default,
		...widgetLanguagesData[locale as 'pt-BR'],
	};

	return { messages };
});

// export default getRequestConfig(async ({ locale }) => {
// 	const names = [
// 		"affiliates",
// 		"auth",
// 		"billing",
// 		"credits",
// 		"dashboard",
// 		"header",
// 		"help",
// 		"modules",
// 		"notfound",
// 		"plans",
// 		"quotation",
// 		"settings",
// 		"ui",
// 		"meta",
// 	];
// 	const solved = await Promise.all([
// 		...names.map((v) => import(`./translations/${locale}/${v}.json`)),
// 		{
// 			default: widgetLanguagesData[locale as "pt-BR"],
// 		},
// 	]);

// 	let messages = {};

// 	solved.forEach((v) => {
// 		messages = { ...messages, ...v.default };
// 	});

// 	return {
// 		messages,
// 	};
// });
