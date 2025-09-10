import { useUser } from '@/lib';
import { makeSignPath } from '@/lib/sign/helpers';
import { LogOut, User2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { CustomButton } from '../custom-button';

export const UserSubmenu = () => {
	const { user, logout } = useUser();
	const [isLogoutLoading, setLogoutLoading] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	const t = useTranslations('header');

	return (
		<div className="bg-foreground/5 flex flex-col items-stretch">
			<button className="flex cursor-default items-center gap-2 rounded-t-xl px-4 py-4">
				<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full  bg-sky-400 text-white">
					<User2 size={20} />
				</div>
				<div className="ml-2 flex flex-col items-start">
					<div>{user?.email}</div>
				</div>
			</button>
			<div className="border-divider-700 flex flex-col border-y py-2">
				<button className="text-active flex items-center gap-2 bg-slate-700/5 px-4 py-2 transition-colors hover:bg-slate-700/10 dark:bg-slate-50/5 dark:hover:bg-slate-50/10">
					<User2 size={18} />
					<div className="line-clamp-1 text-left text-sm">{t('account.personal')}</div>
				</button>
				<a className="text-active px-4 py-2 text-sm hover:underline" href="/organization">
					{t('account.manage')}
				</a>
			</div>
			<CustomButton
				className="flex items-center gap-2 rounded-t-none px-4 py-4 transition-colors"
				loading={isLogoutLoading}
				onClick={async () => {
					setLogoutLoading(true);

					await logout();
					router.push(makeSignPath(pathname));
					setLogoutLoading(false);
				}}>
				<LogOut size={18} />
				{t('account.logout')}
			</CustomButton>
		</div>
	);
};
