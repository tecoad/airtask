'use client';

import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { useDisabled } from '@/core/contexts/disabled-provider';
import { cn } from '@/lib/utils';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { CheckIcon, X } from 'lucide-react';
import { ReactNode } from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { CustomButton } from '../custom-button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface Props<D extends FieldValues> {
	placeholder?: string;
	label: string;
	items: { label: string; value: string }[];
	className?: string;
	control: Control<D, any>;
	name: Path<D>;
	description?: string;
	search?: {
		enabled?: boolean;
		placeholder?: string;
		noResults?: string;
	};
	skeletonMode?: boolean;
	enableDelete?: boolean;
	replaceInput?: ReactNode;
}

export const PopoverSelectField = <D extends FieldValues>({
	placeholder,
	label,
	items,
	className,
	control,
	name,
	description,
	skeletonMode,
	enableDelete,
	replaceInput,
	search = {
		enabled: false,
		placeholder: 'Search...',
		noResults: 'No results found',
	},
}: Props<D>) => {
	const disabled = useDisabled();

	return (
		<FormField
			control={control}
			name={name as any}
			render={({ field }) => (
				<FormItem className={`${className} flex flex-col `}>
					<FormLabel>{label}</FormLabel>
					<div className="flex flex-row items-center gap-1">
						{replaceInput || (
							<>
								<Popover>
									<PopoverTrigger
										asChild
										className={`w-full ${skeletonMode ? 'is-skeleton' : undefined}`}>
										<FormControl>
											<CustomButton
												variant="outline"
												role="combobox"
												className={cn(
													'justify-between',
													!field.value && 'text-muted-foreground',
												)}
												disabled={disabled}>
												{field.value
													? items.find((item) => item.value === field.value)?.label
													: placeholder || 'Select an item'}

												<CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</CustomButton>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className=" p-0">
										<Command>
											<CommandInput placeholder={search.placeholder} />
											<CommandEmpty>{search.noResults}</CommandEmpty>
											<CommandGroup className="max-h-[130px]">
												{items.map((item) => (
													<CommandItem
														value={item.label}
														key={item.value}
														onSelect={() => {
															field.onChange(item.value);
														}}>
														<CheckIcon
															className={`"mr-2 w-4" h-4
												${item.value === field.value ? 'opacity-100' : 'opacity-0'}`}
														/>
														{item.label}
													</CommandItem>
												))}
											</CommandGroup>
										</Command>
									</PopoverContent>
								</Popover>
							</>
						)}
						{field.value && enableDelete && (
							<CustomButton
								size="icon"
								variant="outline"
								className="h-5 w-5 shrink-0 rounded-full"
								onClick={(e) => {
									e.preventDefault();
									field.onChange(null);
								}}>
								<X size={14} />
							</CustomButton>
						)}
					</div>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
