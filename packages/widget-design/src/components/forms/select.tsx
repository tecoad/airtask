'use client';

import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { ReactNode } from 'react';
import { Control, FieldValues } from 'react-hook-form';

interface Props<D extends FieldValues> {
	placeholder?: string;
	label: string;
	items: { label: ReactNode; value: string }[];
	className?: string;
	control: Control<D, any>;
	name: keyof D;
	description?: string;
	skeletonMode?: boolean;
}

export const SelectField = <D extends FieldValues>({
	placeholder,
	label,
	items,
	className,
	control,
	name,
	description,
	skeletonMode,
}: Props<D>) => {
	return (
		<FormField
			control={control}
			name={name as any}
			render={({ field }) => (
				<FormItem className={`${className} wdg-flex wdg-flex-col `}>
					<FormLabel>{label}</FormLabel>

					<Select onValueChange={field.onChange} value={field.value}>
						<FormControl>
							<SelectTrigger className={skeletonMode ? 'wdg-is-skeleton' : undefined}>
								<SelectValue placeholder={placeholder} />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{items.map((item, index) => (
								<SelectItem key={index} value={item.value}>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{description && (
						<FormDescription className={skeletonMode ? 'wdg-is-skeleton' : undefined}>
							{description}
						</FormDescription>
					)}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
