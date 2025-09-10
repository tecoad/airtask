import { DialogProps } from '@radix-ui/react-dialog';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';
import * as React from 'react';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const Command = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
	<CommandPrimitive
		ref={ref}
		className={cn(
			'wdg-flex wdg-h-full wdg-w-full wdg-flex-col wdg-overflow-hidden wdg-rounded-md wdg-bg-popover wdg-text-popover-foreground',
			className,
		)}
		{...props}
	/>
));
Command.displayName = CommandPrimitive.displayName;

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
	return (
		<Dialog {...props}>
			<DialogContent className="wdg-overflow-hidden wdg-p-0 wdg-shadow-lg">
				<Command className="[&_[cmdk-group-heading]]:wdg-px-2 [&_[cmdk-group-heading]]:wdg-font-medium [&_[cmdk-group-heading]]:wdg-text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:wdg-pt-0 [&_[cmdk-group]]:wdg-px-2 [&_[cmdk-input-wrapper]_svg]:wdg-h-5 [&_[cmdk-input-wrapper]_svg]:wdg-w-5 [&_[cmdk-input]]:wdg-h-12 [&_[cmdk-item]]:wdg-px-2 [&_[cmdk-item]]:wdg-py-3 [&_[cmdk-item]_svg]:wdg-h-5 [&_[cmdk-item]_svg]:wdg-w-5">
					{children}
				</Command>
			</DialogContent>
		</Dialog>
	);
};

const CommandInput = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Input>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
	<div className="wdg-flex wdg-items-center wdg-border-b wdg-px-3" cmdk-input-wrapper="">
		<Search className="wdg-mr-2 wdg-h-4 wdg-w-4 wdg-opacity-50 wdg-shrink-0" />
		<CommandPrimitive.Input
			ref={ref}
			className={cn(
				'wdg-flex wdg-h-11 wdg-w-full wdg-rounded-md wdg-bg-transparent wdg-py-3 wdg-text-sm wdg-outline-none placeholder:wdg-text-muted-foreground disabled:wdg-cursor-not-allowed disabled:wdg-opacity-50',
				className,
			)}
			{...props}
		/>
	</div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.List
		ref={ref}
		className={cn(
			'wdg-overflow-y-auto wdg-overflow-x-hidden wdg-max-h-[300px]',
			className,
		)}
		{...props}
	/>
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Empty>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
	<CommandPrimitive.Empty
		ref={ref}
		className="wdg-py-6 wdg-text-center wdg-text-sm"
		{...props}
	/>
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Group>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.Group
		ref={ref}
		className={cn(
			'wdg-overflow-hidden wdg-p-1 wdg-text-foreground [&_[cmdk-group-heading]]:wdg-px-2 [&_[cmdk-group-heading]]:wdg-py-1.5 [&_[cmdk-group-heading]]:wdg-text-xs [&_[cmdk-group-heading]]:wdg-font-medium [&_[cmdk-group-heading]]:wdg-text-muted-foreground',
			className,
		)}
		{...props}
	/>
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.Separator
		ref={ref}
		className={cn('wdg--mx-1 wdg-h-px wdg-bg-border', className)}
		{...props}
	/>
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.Item
		ref={ref}
		className={cn(
			'wdg-relative wdg-flex wdg-cursor-default wdg-select-none wdg-items-center wdg-rounded-sm wdg-px-2 wdg-py-1.5 wdg-text-sm wdg-outline-none aria-selected:wdg-bg-accent aria-selected:wdg-text-accent-foreground data-[disabled]:wdg-pointer-events-none data-[disabled]:wdg-opacity-50',
			className,
		)}
		{...props}
	/>
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
	className,
	...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
	return (
		<span
			className={cn(
				'wdg-ml-auto wdg-text-xs wdg-tracking-widest wdg-text-muted-foreground',
				className,
			)}
			{...props}
		/>
	);
};
CommandShortcut.displayName = 'CommandShortcut';

export {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
};
