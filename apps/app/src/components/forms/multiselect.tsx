import { cn } from '@/lib/utils';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type OptionType = {
	label: string;
	value: string;
};

interface MultiSelectProps {
	options: OptionType[];
	selected: OptionType[];
	onChange: React.Dispatch<OptionType[]>;
	className?: string;
	placeholder?: string;
}

function MultiSelect({
	options,
	selected,
	onChange,
	className,
	placeholder,
	...props
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);

	const handleUnselect = (item: OptionType) => {
		onChange(selected.filter((i) => i.value !== item.value));
	};

	const t = useTranslations('ui.multiselect');

	return (
		<Popover open={open} onOpenChange={setOpen} {...props}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={`w-full justify-between p-2 ${
						selected.length > 1 ? 'h-full' : 'h-10'
					}`}
					onClick={() => setOpen(!open)}>
					<div className="flex flex-wrap  gap-1">
						{selected.length === 0 && (
							<span className="text-muted-foreground">
								{placeholder ? placeholder : t('placeholder')}
							</span>
						)}
						{selected.map((item) => (
							<Badge variant="secondary" key={item.value} onClick={() => handleUnselect(item)}>
								{item.label}
								<button
									className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											handleUnselect(item);
										}
									}}
									onMouseDown={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									onClick={() => handleUnselect(item)}>
									<X className="text-muted-foreground hover:text-foreground h-3 w-3" />
								</button>
							</Badge>
						))}
					</div>
					<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command className={className}>
					<CommandInput placeholder="Search ..." />
					<CommandEmpty>No item found.</CommandEmpty>
					<CommandGroup className="max-h-64 overflow-auto">
						{options.map((option) => {
							const isSelected = selected.find((i) => i.value === option.value);

							return (
								<CommandItem
									key={option.value}
									onSelect={() => {
										onChange(
											isSelected
												? selected.filter((item) => item.value !== option.value)
												: [...selected, option],
										);
										setOpen(true);
									}}>
									<Check
										className={cn(
											'mr-2 h-4 w-4',
											isSelected ? 'opacity-100' : 'opacity-0',
										)}
									/>
									{option.label}
								</CommandItem>
							);
						})}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

export { MultiSelect };
