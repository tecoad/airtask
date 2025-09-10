import { LanguageCode } from '@/core/shared/gql-api-schema';
import { i18nAvailableLanguages } from '@/translations';
import { reverseObject } from './reverse-object';

export const gqlLanguageCodeToI18n: Record<LanguageCode, i18nAvailableLanguages> = {
	[LanguageCode.En]: 'en',
	[LanguageCode.Pt]: 'pt-BR',
};

export const i18nLanguageCodeToGql = reverseObject(gqlLanguageCodeToI18n);
