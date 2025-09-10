'use client';
import { setCookie } from 'cookies-next';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface ThemeContextProps {
	themeActive: 'dark' | 'light' | undefined;
	setThemeActive: (theme: 'dark' | 'light') => void;
}
const ThemeContext = createContext<ThemeContextProps>({} as ThemeContextProps);

interface ThemeProviderProps {
	children: ReactNode;
	defaultTheme: 'dark' | 'light' | undefined;
}

export const ThemeProvider = ({ children, defaultTheme }: ThemeProviderProps) => {
	const [themeActive, setThemeActive] = useState(defaultTheme);

	useEffect(() => {
		setCookie('themeActive', themeActive);
		const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		if (themeActive === 'dark' || (themeActive === undefined && isSystemDark)) {
			document.documentElement.classList.add('dark');
			setCookie('themeActive', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}, [themeActive, setCookie]);

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
