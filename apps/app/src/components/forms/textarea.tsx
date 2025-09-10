'use client';

import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Control, FieldValues } from 'react-hook-form';
import { Textarea } from '../ui/textarea';

interface Props {
	placeholder?: string;
	label: string;
	className?: string;
	control?: Control<FieldValues>;
	name: string;
	description?: string;
}

export const TextareaField = ({
	placeholder,
	label,
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
					<FormControl>
						<Textarea placeholder={placeholder} className="resize-none" {...field} />
					</FormControl>

					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
