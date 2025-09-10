import { cn } from '@/lib/utils';
import React from 'react';
import { Aside } from './aside';
import { SidebarNavProps } from './sidebar-nav';

interface Props extends SidebarNavProps {
	children: React.ReactNode;
	fullWidth?: boolean;
}

const AsideContent = ({ items, children, fullWidth }: Props) => {
	return (
		<div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
			<Aside items={items} />
			<div className={cn('relative flex-1 space-y-4', !fullWidth && 'lg:max-w-xl')}>
				{children}
			</div>
		</div>
	);
};

export default AsideContent;
