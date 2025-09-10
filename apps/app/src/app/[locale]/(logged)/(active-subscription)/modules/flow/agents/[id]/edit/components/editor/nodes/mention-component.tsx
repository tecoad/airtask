import {
	BeautifulMentionsItem,
	BeautifulMentionsTheme,
} from 'lexical-beautiful-mentions';

import { cn } from '@/lib/utils';
import {
	BeautifulMentionsMenuItemProps,
	BeautifulMentionsMenuProps,
} from 'lexical-beautiful-mentions';

import { BeautifulMentionComponentProps } from 'lexical-beautiful-mentions';
import { forwardRef } from 'react';

export const mentionItems: Record<string, BeautifulMentionsItem[]> = {
	'{': ['{prospectName}', '{knowledgeBase}'],
};

export const beautifulMentionsTheme: BeautifulMentionsTheme = {
	// 👇 use the trigger name as the key
	'{': 'text-white px-2 py-1 rounded-sm highlight-white/30 bg-gradient-to-tr from-pink-400 to-pink-600',
	// 👇 add the "Focused" suffix to style the focused mention
	'{Focused': 'outline-none shadow-md',
};

export const CustomMentionComponent = forwardRef<
	HTMLSpanElement,
	BeautifulMentionComponentProps
>(({ trigger, value, children, ...other }, ref) => {
	return (
		<span {...other} ref={ref} title={value}>
			{value}
		</span>

		// <TooltipProvider>
		// 	<Tooltip>
		// 		<TooltipTrigger>
		// 			<span {...other} ref={ref}>
		// 				{`{${value}}`}
		// 			</span>
		// 		</TooltipTrigger>
		// 		<TooltipContent>
		// 			<p>
		// 				Trigger: <code>{trigger}</code>
		// 			</p>
		// 			<p>
		// 				Value: <code>{value}</code>
		// 			</p>
		// 		</TooltipContent>
		// 	</Tooltip>
		// </TooltipProvider>
	);
});

/**
 * Menu component for the BeautifulMentionsPlugin.
 */
export const Menu = forwardRef<any, BeautifulMentionsMenuProps>(
	({ open, loading, ...other }, ref) => {
		if (loading) {
			return (
				<div
					ref={ref}
					className="bg-popover text-popover-foreground m-0 mt-6 min-w-[8rem] overflow-hidden rounded-md border p-2.5 text-sm shadow-md">
					Loading...
				</div>
			);
		}
		return (
			<ul
				ref={ref}
				style={{
					scrollbarWidth: 'none',
					msOverflowStyle: 'none',
				}}
				className="bg-popover text-popover-foreground absolute top-6 m-0 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md"
				{...other}
			/>
		);
	},
);
Menu.displayName = 'Menu';

/**
 * MenuItem component for the BeautifulMentionsPlugin.
 */
export const MenuItem = forwardRef<HTMLLIElement, BeautifulMentionsMenuItemProps>(
	({ selected, item, itemValue, ...props }, ref) => (
		<li
			ref={ref}
			className={cn(
				'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
				selected && 'bg-accent text-accent-foreground',
			)}
			{...props}
		/>
	),
);
MenuItem.displayName = 'MenuItem';
