'use client';

import { useSidebar } from '@/components/providers/sidebar-provider';
import { ReactNode } from 'react';

export const PageWrapper = ({ children }: { children: ReactNode }) => {
	const { sidebarVisible } = useSidebar();

	return (
		<>
			<div
				className={`minH mobile-only:pb-8 flex flex-col transition-[padding] duration-200 ease-in-out ${
					sidebarVisible ? 'pl-16 md:pl-72' : 'pl-16'
				}`}>
				{children}
			</div>
		</>
	);
};
