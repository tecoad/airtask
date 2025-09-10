'use client';

import { Icons } from '@/components/icons';
import { PanelLeft } from 'lucide-react';
import { UserMenu } from './user-menu';

import { useSidebar } from '../providers/sidebar-provider';
import { BottomItems } from './bottom-items';
import NestedMenu from './nested-menu';

const Sidebar = () => {
	const { sidebarVisible, setSidebarVisible } = useSidebar();

	const handleToggleSidebar = () => {
		setSidebarVisible(!sidebarVisible);
	};

	return (
		<header
			className={`border-foreground/10 bg-background transition-[width, height] fixed bottom-0 left-0 top-0 z-50 flex flex-col items-stretch gap-6 overflow-hidden border-r duration-200 ease-in-out  ${
				sidebarVisible ? 'w-72' : 'w-16'
			}`}>
			{/* LOGO */}
			<div className="mt-6 flex flex-row items-center justify-between">
				<div
					className="flex cursor-pointer flex-row items-center"
					onClick={handleToggleSidebar}>
					<span
						className={`flex w-16 justify-center ${
							sidebarVisible ? 'text-slate-400' : 'text-sky-500'
						} text-center`}>
						<Icons.logoSymbol className="h-11" />
					</span>
					{sidebarVisible && (
						<span className="block text-slate-600 dark:text-slate-100">
							<Icons.logoType />
						</span>
					)}
				</div>
				{sidebarVisible && (
					<button
						className="dark:highlight-white/5 mr-3 flex h-7 w-7 cursor-pointer flex-row items-center justify-center rounded bg-slate-400/5 p-1 transition-colors transition-colors  hover:bg-slate-400/20 hover:text-sky-500"
						onClick={handleToggleSidebar}>
						<PanelLeft size={18} strokeWidth={1.8} />
					</button>
				)}
			</div>

			{/* ITEMS */}
			<NestedMenu />

			{/* SPACER */}
			<div className="flex-grow" />

			{/* BOTTOM ITEMS */}
			<BottomItems />

			{/* User menu */}
			<UserMenu />
		</header>
	);
};

export default Sidebar;
