import { createInstance } from 'i18next';
import { Namespace, TFunction } from 'react-i18next';
import { LanguageCode, emailTemplatesI18n } from '../translations';
import { EmailTemplatesI18nMessages } from '../translations/types';

export const useTranslation = <D extends Namespace<keyof EmailTemplatesI18nMessages>>(
	namespace: D,
	{ language = 'pt' }: { language: LanguageCode },
) => {
	const i18n = createInstance({
		lng: language,
		resources: emailTemplatesI18n,
	});

	i18n.init();

	const t = i18n.getFixedT(language, namespace);

	return {
		i18n,
		t: t as TFunction<D, undefined>,
	};
};

declare module 'react-i18next' {
	// and extend them!
	interface CustomTypeOptions {
		defaultNS: keyof EmailTemplatesI18nMessages;
		// custom resources type
		resources: (typeof emailTemplatesI18n)['en'];
	}
}
