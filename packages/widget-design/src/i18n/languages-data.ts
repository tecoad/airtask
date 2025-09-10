import en from '../translations/en.json';
import ptBR from '../translations/pt-BR.json';

export const widgetLanguagesData = {
	en,
	'pt-BR': ptBR,
};

export const availableLanguages = Object.keys(widgetLanguagesData);

export type i18nAvailableLanguages = keyof typeof widgetLanguagesData;
