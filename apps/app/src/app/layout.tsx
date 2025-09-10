import {
	NextIntlClientProvider,
	useLocale,
	useMessages,
	useTranslations,
} from 'next-intl';
import localFont from 'next/font/local';

import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { GlobalEventProvider } from '@/core/contexts/global-events';
import { UserProvider } from '@/lib';
import { cookies } from 'next/headers';
import { ClientRootSetup } from './client-root-setup';
import './globals.css';

const charlieText = localFont({
	src: [
		{
			path: './fonts/charlie-text/CharlieText-Regular.woff2',
			weight: '400',
			style: 'normal',
		},
		{
			path: './fonts/charlie-text/CharlieText-Semibold.woff2',
			weight: '600',
			style: 'normal',
		},
		{
			path: './fonts/charlie-text/CharlieText-Bold.woff2',
			weight: '700',
			style: 'normal',
		},
	],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const locale = useLocale(),
		messages = useMessages();

	let cookieValue = cookies().get('themeActive')?.value;

	const t = useTranslations('meta');

	// Set theme cookie as a valid value
	const themeCookie =
		cookieValue === 'dark' || cookieValue === 'light' ? cookieValue : undefined;

	return (
		<html lang={locale} className={themeCookie}>
			<title>{t('brand')}</title>
			<ClientRootSetup />

			<body
				className={`${charlieText.className} overflow-x-hidden bg-white text-slate-500 antialiased dark:bg-slate-900 dark:text-slate-400`}>
				<NextIntlClientProvider locale={locale} messages={messages}>
					<GlobalEventProvider>
						<UserProvider>
							<ThemeProvider defaultTheme={themeCookie}>
								{children}
								<Toaster />
							</ThemeProvider>
						</UserProvider>
					</GlobalEventProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
