'use client';

import { User2 } from 'lucide-react';

import { useUser } from '@/lib';
import { PopoverAnchor } from '@radix-ui/react-popover';
import { useTranslations } from 'next-intl';
import { useSidebar } from '../providers/sidebar-provider';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { UserSubmenu } from './user-submenu';

export const UserMenu = () => {
	const { user, isUserLoading } = useUser();
	const { sidebarVisible, setSidebarVisible } = useSidebar();

	const handleUserSubmenu = () => {
		// setSidebarVisible(true);
	};

	const t = useTranslations('header');

	const avatar = (
		<div
			className={`bg-size-200 bg-pos-0 highlight-white/30 group-hover:bg-pos-100 flex h-10  w-10 items-center justify-center rounded-full transition-all duration-500 ${
				isUserLoading
					? 'bg-foreground/50'
					: 'bg-gradient-to-br from-pink-500 via-red-500 to-yellow-400'
			}`}>
			<User2 className="text-white" size={20} />
		</div>
	);

	return (
		<>
			<Popover>
				<PopoverTrigger onClick={handleUserSubmenu}>
					<div className="group flex cursor-pointer items-center">
						<div className="flex h-16 w-16 shrink-0 items-center justify-center">
							{sidebarVisible ? avatar : <PopoverAnchor>{avatar}</PopoverAnchor>}
						</div>

						{sidebarVisible && (
							<div className="ml-2 flex flex-1 flex-col items-start gap-2">
								<div
									className={`line-clamp-1  text-left text-sm font-semibold leading-none ${
										isUserLoading && 'is-skeleton'
									}`}>
									{isUserLoading ? 'Firstname' : user?.first_name}
								</div>

								<div
									className={`text-foreground/60 line-clamp-1 text-sm  leading-none ${
										isUserLoading && 'is-skeleton'
									}`}>
									{isUserLoading ? 'loading@skeleton' : user?.email}
								</div>
							</div>
						)}
					</div>
				</PopoverTrigger>
				<PopoverContent
					sideOffset={8}
					align={sidebarVisible ? 'center' : 'start'}
					className={`w-64 overflow-hidden  p-0 shadow-2xl`}>
					<UserSubmenu />
				</PopoverContent>
			</Popover>
		</>
	);
};
