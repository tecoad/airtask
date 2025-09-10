'use client';

import { CheckIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ChevronsUpDown, Loader2 } from 'lucide-react';
import { CustomButton } from '../custom-button';
import { useSidebar } from '../providers/sidebar-provider';

export interface Value {
	id: string;
	label: string;
}

interface Props {
	values: Value[];
	enableSearch?: boolean;
	icon?: React.ReactNode;
	searchPlaceholder?: string;
	onChange?: (selectedValue: Value) => void;
	defaultValue?: Value;
	skeletonMode?: boolean;
	onSearch?: (search: string) => void;
	isLoading?: boolean;
}

export default function Switcher({
	values,
	enableSearch,
	icon,
	searchPlaceholder,
	onChange,
	defaultValue,
	skeletonMode,
	isLoading,
	onSearch,
}: Props) {
	const [open, setOpen] = React.useState(false);
	const [selectedValue, setSelectedValue] = React.useState<Value | undefined>(
		defaultValue,
	);

	const { sidebarVisible } = useSidebar();

	return (
		<Popover
			open={open}
			onOpenChange={(v) => {
				setOpen(v);

				if (!v) onSearch?.('');
			}}>
			<PopoverTrigger asChild>
				<CustomButton
					variant="outline"
					role="combobox"
					aria-expanded={open}
					aria-label="Select a user"
					className={`h-8 justify-center ${
						sidebarVisible ? 'w-full self-stretch' : 'w-8 self-center'
					}`}>
					{icon}
					{sidebarVisible && (
						<div className="text-foreground/50 mx-2 flex items-center justify-center text-sm font-normal">
							<div className="line-clamp-1">{selectedValue?.label}</div>
						</div>
					)}
					{sidebarVisible && <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />}
				</CustomButton>
			</PopoverTrigger>
			<PopoverContent
				sideOffset={8}
				side="top"
				align={sidebarVisible ? 'center' : 'start'}
				className={`w-64 p-0 shadow-xl`}>
				<Command
					aria-loading={isLoading}
					shouldFilter={false}
					onChange={(e) => {
						onSearch?.((e.target as any).value);
					}}>
					{enableSearch && <CommandInput placeholder={searchPlaceholder} />}
					{!isLoading && <CommandEmpty>Nothing found.</CommandEmpty>}
					<CommandGroup>
						{isLoading ? (
							<div className="flex flex-row items-center  justify-center p-[24px]">
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							</div>
						) : (
							values.map((value) => (
								<CommandItem
									key={value.id}
									onSelect={() => {
										setSelectedValue(value);
										setOpen(false);
										onChange && onChange(value);
									}}
									className="cursor-pointer text-sm">
									<div className="line-clamp-1">{value.label}</div>
									<CheckIcon
										className={cn(
											'ml-2 h-4 w-4 flex-shrink-0',
											selectedValue?.id === value.id ? 'opacity-100' : 'opacity-0',
										)}
									/>
								</CommandItem>
							))
						)}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
