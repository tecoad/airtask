import { widgetLanguagesData } from '@airtask/widget-design/src/i18n/languages-data';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
	const messages = {
		...(await import(`./translations/${locale}.json`)).default,
		...widgetLanguagesData[locale as 'pt-BR'],
	};

	return { messages };
});
