'use client';

import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from 'lucide-react';
import { Control, FieldValues } from 'react-hook-form';
import { buttonVariants } from '../ui/button';

interface Props {
	label: string;
	items: { label: string; value: string }[];
	className?: string;
	control?: Control<FieldValues>;
	name: string;
	description?: string;
}

export const SystemSelectField = ({
	label,
	items,
	className,
	control,
	name,
	description,
}: Props) => {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={`${className} flex flex-col `}>
					<FormLabel>{label}</FormLabel>

					<div className="relative w-max">
						<FormControl>
							<select
								className={cn(
									buttonVariants({ variant: 'outline' }),
									'w-[200px] appearance-none bg-transparent font-normal',
								)}
								{...field}>
								{items.map((item, index) => (
									<option key={index} value={item.value}>
										{item.label}
									</option>
								))}
							</select>
						</FormControl>
						<ChevronDownIcon className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
					</div>
					{description && <FormDescription>{description}</FormDescription>}

					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
