'use client';
import { setCookie } from 'cookies-next';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type ThemeType = 'dark' | 'light';

interface ThemeContextProps {
	themeActive: ThemeType;
	setThemeActive: (theme: ThemeType) => void;
}
const ThemeContext = createContext<ThemeContextProps>({} as ThemeContextProps);

interface ThemeProviderProps {
	children: ReactNode;
	defaultTheme: ThemeType;
}

export const ThemeProvider = ({ children, defaultTheme }: ThemeProviderProps) => {
	const [themeActive, setThemeActive] = useState(defaultTheme);

	useEffect(() => {
		setCookie('widgetTheme', themeActive);
		const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		if (themeActive === 'dark' || (themeActive === undefined && isSystemDark)) {
			// document.documentElement.classList.add('dark');
			setCookie('widgetTheme', 'dark');
		} else {
			setCookie('widgetTheme', 'light');
			// document.documentElement.classList.remove('dark');
		}
	}, [themeActive]);

	return (
		<ThemeContext.Provider
			value={{
				themeActive,
				setThemeActive,
			}}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => useContext(ThemeContext);
