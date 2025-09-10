'use client';

import { i18nAvailableLanguages, locales } from '@/translations';
import { Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

import Switcher from './switcher';

export default function LanguageSwitcher() {
	const t = useTranslations('header');
	const { useRouter, usePathname } = createSharedPathnamesNavigation({ locales });
	const pathname = usePathname();
	const router = useRouter();
	const locale = useLocale();

	const selectedLanguage = locale as i18nAvailableLanguages;

	const languageToLabel: Record<i18nAvailableLanguages, string> = {
		en: t('languages.english'),
		'pt-BR': t('languages.portuguese'),
	};

	const localeToValue = (language: i18nAvailableLanguages) => ({
		id: language,
		// @ts-ignore
		label: languageToLabel[language],
	});

	return (
		<>
			<Switcher
				values={locales.map(localeToValue)}
				defaultValue={localeToValue(selectedLanguage)}
				onChange={(selectedValue) => {
					router.replace(pathname, { locale: selectedValue.id });
					router.refresh();
				}}
				icon={
					<Languages
						size={16}
						strokeWidth={2}
						className="text-foreground/90 flex-shrink-0"
					/>
				}
			/>
		</>
	);
}
