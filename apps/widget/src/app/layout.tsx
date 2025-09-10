import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl';
import { ReactNode } from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
	const locale = useLocale(),
		messages = useMessages();

	return (
		<html>
			<body>
				<title>Airtask Widget</title>
				{/* <FaviconMeta domain={ENV.PUBLIC.url} /> */}
				<NextIntlClientProvider locale={locale} messages={messages}>
					{children}
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
