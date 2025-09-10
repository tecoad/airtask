import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					'wdg-flex wdg-h-10 wdg-w-full wdg-rounded-md wdg-border wdg-border-input wdg-bg-background wdg-px-3 wdg-py-2 wdg-text-sm wdg-ring-offset-background file:wdg-border-0 file:wdg-bg-transparent file:wdg-text-sm file:wdg-font-medium placeholder:wdg-text-muted-foreground focus-visible:wdg-outline-none focus-visible:wdg-ring-2 focus-visible:wdg-ring-ring focus-visible:wdg-ring-offset-2 disabled:wdg-cursor-not-allowed disabled:wdg-opacity-50',
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Input.displayName = 'Input';

export { Input };
