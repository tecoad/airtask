export const locales = ['en', 'pt-BR'] as const;
export type i18nAvailableLanguages = (typeof locales)[number];
