import { cn } from '@/lib/utils';
import * as LabelPrimitive from '@radix-ui/react-label';
import React from 'react';
import { FormLabel, useFormField } from '../ui/form';

export const CustomFormLabel = React.forwardRef<
	React.ElementRef<typeof LabelPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
	const { error, formItemId } = useFormField();

	return (
		<FormLabel
			ref={ref}
			className={cn(error && 'wdg-text-primary', className)}
			htmlFor={formItemId}
			{...props}
		/>
	);
});
