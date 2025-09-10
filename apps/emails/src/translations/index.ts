import en from './en.json';
import pt from './pt-BR.json';

export const emailTemplatesI18n = {
	en,
	pt,
};

export type LanguageCode = keyof typeof emailTemplatesI18n;
