import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	'wdg-inline-flex wdg-items-center wdg-justify-center wdg-rounded-md wdg-text-sm wdg-font-medium wdg-ring-offset-background wdg-transition-colors focus-visible:wdg-outline-none focus-visible:wdg-ring-2 focus-visible:wdg-ring-ring focus-visible:wdg-ring-offset-2 disabled:wdg-pointer-events-none disabled:wdg-opacity-50',
	{
		variants: {
			variant: {
				default: 'wdg-bg-primary wdg-text-primary-foreground hover:wdg-bg-primary/90',
				destructive:
					'wdg-bg-destructive wdg-text-destructive-foreground hover:wdg-bg-destructive/90',
				outline:
					'wdg-border wdg-border-input wdg-bg-background hover:wdg-bg-accent hover:wdg-text-accent-foreground',
				secondary:
					'wdg-bg-secondary wdg-text-secondary-foreground hover:wdg-bg-secondary/80',
				ghost: 'hover:wdg-bg-accent hover:wdg-text-accent-foreground',
				link: 'wdg-text-primary wdg-underline-offset-4 hover:wdg-underline',
			},
			size: {
				default: 'wdg-h-10 wdg-px-4 wdg-py-2',
				sm: 'wdg-h-9 wdg-rounded-md wdg-px-3',
				lg: 'wdg-h-11 wdg-rounded-md wdg-px-8',
				icon: 'wdg-h-10 wdg-w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button';
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = 'Button';

export { Button, buttonVariants };
