import React from 'react';
import { CustomButton } from '../custom-button';
import { useSidebar } from '../providers/sidebar-provider';

interface Props {
	icon?: React.ReactNode;
	title: string;
	action?: () => void | string;
}

export const BottomSelect = (props: Props) => {
	const { icon, title, action } = props;
	const { sidebarVisible } = useSidebar();

	return (
		<div
			className={`flex h-8 cursor-pointer items-center justify-center rounded-md   transition-colors  ${
				sidebarVisible ? 'self-stretch' : 'w-8 self-center'
			}`}>
			<div className="text-foreground/90">{icon}</div>
			{sidebarVisible && (
				<div className="text-foreground/50 ml-2 line-clamp-1 text-sm font-normal">
					{title}
				</div>
			)}
		</div>
	);
};

export const BottomItem = (props: Props) => {
	const { icon, title, action } = props;
	const { sidebarVisible } = useSidebar();

	return (
		<CustomButton
			variant="outline"
			className={`flex h-8 cursor-pointer items-center justify-center rounded-md   transition-colors  ${
				sidebarVisible ? 'self-stretch' : 'w-8 self-center'
			}`}
			onClick={action}>
			<div className="text-foreground/90">{icon}</div>
			{sidebarVisible && (
				<div className="text-foreground/50 ml-2 line-clamp-1 text-sm font-normal">
					{title}
				</div>
			)}
		</CustomButton>
	);
};
