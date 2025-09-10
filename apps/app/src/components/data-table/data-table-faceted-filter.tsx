import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { Column } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useGlobalEvents } from '@/core/contexts/global-events';
import { cn } from '@/lib/utils';
import { CustomButton } from '../custom-button';

export type FilterOption = {
	label: string;
	value: string | boolean | number;
	icon?: React.ComponentType<{ className?: string }>;
};

interface DataTableFacetedFilter<TData, TValue, Option extends FilterOption> {
	column?: Column<TData, TValue>;
	title?: string;
	options: Option[];

	serverFilters: FilterOption['value'][];
	onServerFilter?(filters: Option['value'][]): void;

	isMultiple?: boolean;
}

export function DataTableFacetedFilter<TData, TValue, Option extends FilterOption>({
	column,
	title,
	options,
	onServerFilter,
	serverFilters,
	isMultiple,
}: DataTableFacetedFilter<TData, TValue, Option>) {
	const facets = column?.getFacetedUniqueValues();
	const [serverSelectedValues, setServerSelectedValues] = React.useState(
		new Set(serverFilters as string[]),
	);
	const clientSelectedValues = new Set<FilterOption['value']>(
		column?.getFilterValue() as string[],
	);

	const selectedValues = column ? clientSelectedValues : serverSelectedValues;

	const renderes = React.useRef(0);
	React.useEffect(() => {
		renderes.current++;

		if (renderes.current === 1) return;

		onServerFilter?.(Array.from(serverSelectedValues));
	}, [serverSelectedValues]);

	const { subscribe } = useGlobalEvents();

	React.useEffect(() => {
		return subscribe('data-table.allFiltersRemoved', () => {
			console.log('oi');
			setServerSelectedValues(new Set([] as any[]));
		});
	}, []);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<CustomButton variant="outline" size="sm" className="h-8 border-dashed">
					<PlusCircledIcon className="mr-2 h-4 w-4" />
					{title}
					{selectedValues?.size > 0 && (
						<>
							<Separator orientation="vertical" className="mx-2 h-4" />
							<Badge
								variant="secondary"
								className="rounded-sm px-1 font-normal lg:hidden">
								{selectedValues.size}
							</Badge>
							<div className="hidden space-x-1 lg:flex">
								{selectedValues.size > 2 ? (
									<Badge variant="secondary" className="rounded-sm px-1 font-normal">
										{selectedValues.size} selected
									</Badge>
								) : (
									options
										.filter((option) => selectedValues.has(option.value))
										.map((option, k) => (
											<Badge
												variant="secondary"
												key={k}
												className="rounded-sm px-1 font-normal">
												{option.label}
											</Badge>
										))
								)}
							</div>
						</>
					)}
				</CustomButton>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="start">
				<Command aria-multiselectable={false}>
					<CommandInput placeholder={title} />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{options.map((option, k) => {
								const isSelected = selectedValues.has(option.value);
								return (
									<CommandItem
										key={k}
										onSelect={() => {
											if (isMultiple) {
												if (isSelected) {
													selectedValues.delete(option.value);
												} else {
													selectedValues.add(option.value);
												}
											} else {
												selectedValues.forEach((v) => {
													selectedValues.delete(v);
												});
												selectedValues.add(option.value);
											}

											const filterValues = Array.from(selectedValues);

											if (column) {
												column?.setFilterValue(
													filterValues.length ? filterValues : undefined,
												);
											} else {
												setServerSelectedValues(
													filterValues.length
														? new Set(filterValues)
														: new Set([] as any[]),
												);
											}
										}}>
										<div
											className={cn(
												'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
												isSelected
													? 'bg-primary text-primary-foreground'
													: 'opacity-50 [&_svg]:invisible',
											)}>
											<CheckIcon className={cn('h-4 w-4')} />
										</div>
										{option.icon && (
											<option.icon className="text-muted-foreground mr-2 h-4 w-4" />
										)}
										<span>{option.label}</span>
										{facets?.get(option.value) && (
											<span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
												{facets.get(option.value)}
											</span>
										)}
									</CommandItem>
								);
							})}
						</CommandGroup>
						{selectedValues.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => {
											if (column) {
												column.setFilterValue(undefined);
											} else {
												setServerSelectedValues(new Set([]));
											}
										}}
										className="justify-center text-center">
										Clear filters
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
