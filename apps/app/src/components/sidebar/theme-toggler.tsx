import { useTheme } from '@/components/providers/theme-provider';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BottomItem } from './bottom-item';

export const ThemeToggler = () => {
	const t = useTranslations('header');
	const { setThemeActive, themeActive } = useTheme();

	return (
		<>
			<BottomItem
				icon={
					themeActive === 'dark' ? (
						<Sun size={16} strokeWidth={2} />
					) : (
						<Moon size={16} strokeWidth={2} />
					)
				}
				action={() => setThemeActive(themeActive === 'dark' ? 'light' : 'dark')}
				title={themeActive === 'dark' ? t('lightMode') : t('darkMode')}
			/>
		</>
	);
};
