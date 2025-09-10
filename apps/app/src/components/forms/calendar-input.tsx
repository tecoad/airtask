import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Control, FieldValues } from 'react-hook-form';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { CustomButton } from '../custom-button';

interface Props {
	placeholder?: string;
	label: string;
	className?: string;
	control?: Control<FieldValues>;
	name: string;
	description?: string | React.ReactNode;
}

export const CalendarInputField = ({
	placeholder,
	label,
	className,
	control,
	name,
	description,
}: Props) => {
	return (
		<>
			<FormField
				control={control}
				name={name}
				render={({ field }) => (
					<FormItem className={`${className} flex flex-col`}>
						<FormLabel>{label}</FormLabel>
						<Popover>
							<PopoverTrigger asChild>
								<FormControl>
									<CustomButton
										variant={'outline'}
										className={cn(
											'pl-3 text-left font-normal',
											!field.value && 'text-muted-foreground',
										)}>
										{field.value ? (
											format(field.value, 'PPP')
										) : (
											<span>{placeholder}</span>
										)}
										<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
									</CustomButton>
								</FormControl>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={field.value}
									onSelect={field.onChange}
									disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
									initialFocus
								/>
							</PopoverContent>
						</Popover>

						{description && <FormDescription>{description}</FormDescription>}
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
