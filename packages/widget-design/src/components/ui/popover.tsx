import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
	<PopoverPrimitive.Portal>
		<PopoverPrimitive.Content
			ref={ref}
			align={align}
			sideOffset={sideOffset}
			className={cn(
				'wdg-z-50 wdg-w-72 wdg-rounded-md wdg-border wdg-bg-popover wdg-p-4 wdg-text-popover-foreground wdg-shadow-md wdg-outline-none data-[state=open]:wdg-animate-in data-[state=closed]:wdg-animate-out data-[state=closed]:wdg-fade-out-0 data-[state=open]:wdg-fade-in-0 data-[state=closed]:wdg-zoom-out-95 data-[state=open]:wdg-zoom-in-95 data-[side=bottom]:wdg-slide-in-from-top-2 data-[side=left]:wdg-slide-in-from-right-2 data-[side=right]:wdg-slide-in-from-left-2 data-[side=top]:wdg-slide-in-from-bottom-2',
				className,
			)}
			{...props}
		/>
	</PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverContent, PopoverTrigger };
