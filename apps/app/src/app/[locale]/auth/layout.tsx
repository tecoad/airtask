import * as React from 'react';

import { Icons } from '@/components/icons';

import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

type AuthLayout = {
	children: ReactNode;
};

const LoggedLayout: React.FC<AuthLayout> = ({ children }) => {
	const t = useTranslations('auth');

	return (
		<div className="minH container relative grid flex-col items-center justify-stretch   lg:max-w-none lg:grid-cols-2 lg:px-0">
			<div className="bg-muted text-primary relative hidden h-full flex-col border-r p-10 lg:flex">
				<div className="absolute inset-0" />
				<div className="relative z-20 flex items-center">
					<Icons.LogoFull className="text-foreground" />
				</div>
				<div className="relative z-20 mt-auto">
					<blockquote className="space-y-2">
						<p className="text-lg">{t('quote.text')}</p>
						<footer className="text-sm">{t('quote.author')}</footer>
					</blockquote>
				</div>
			</div>
			<div className=" ">{children}</div>
		</div>
	);
};

export default LoggedLayout;
