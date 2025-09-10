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
import { CaretSortIcon } from '@radix-ui/react-icons';
import { CheckIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';
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
	label?: string;
	items: { label: string; value: string; customSelectedLabel?: ReactNode }[];
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
	maxItemsAtSearch?: number;
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
	search = {
		enabled: false,
		placeholder: 'Search...',
		noResults: 'No results found',
	},
	maxItemsAtSearch,
}: Props<D>) => {
	const [searchInput, setSearch] = useState('');
	return (
		<FormField
			control={control}
			name={name as any}
			render={({ field }) => {
				const selectedItem = items.find((item) => item.value === field.value);

				return (
					<FormItem className={`${className} wdg-flex wdg-flex-col `}>
						{label && <FormLabel>{label}</FormLabel>}
						<Popover>
							<PopoverTrigger
								asChild
								className={skeletonMode ? 'wdg-is-skeleton' : undefined}>
								<FormControl>
									<CustomButton
										variant="outline"
										role="combobox"
										className={cn(
											'wdg-justify-between  wdg-pl-2 wdg-pr-1',
											!field.value && 'wdg-text-muted-foreground',
										)}>
										<div className="wdg-flex wdg-w-[60px] wdg-items-center wdg-justify-center wdg-overflow-hidden ">
											{field.value
												? selectedItem?.customSelectedLabel || selectedItem?.label
												: placeholder || 'Select an item'}
										</div>
										<CaretSortIcon className="wdg-h-4 wdg-w-4 wdg-shrink-0 wdg-opacity-50" />
									</CustomButton>
								</FormControl>
							</PopoverTrigger>
							<PopoverContent className=" p-0">
								<Command
									onChange={(e) => {
										setSearch((e.target as any).value);
									}}>
									<CommandInput placeholder={search.placeholder} />
									<CommandEmpty>{search.noResults}</CommandEmpty>
									<CommandGroup className="max-h-[130px]">
										{(maxItemsAtSearch
											? items
													.filter((item) =>
														item.label
															.toLowerCase()
															.startsWith(searchInput.toLowerCase()),
													)
													.slice(0, maxItemsAtSearch)
											: items
										).map((item) => (
											<CommandItem
												value={item.label}
												key={item.value}
												onSelect={() => {
													console.log();
													field.onChange(item.value);
												}}>
												<CheckIcon
													className={`"wdg-mr-2 wdg-w-4" wdg-h-4
												${item.value === field.value ? 'wdg-opacity-100' : 'wdg-opacity-0'}`}
												/>
												{item.label}
											</CommandItem>
										))}
									</CommandGroup>
								</Command>
							</PopoverContent>
						</Popover>
						{description && <FormDescription>{description}</FormDescription>}
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
};
