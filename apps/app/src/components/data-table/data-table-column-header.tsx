import {
	ArrowDownIcon,
	ArrowUpIcon,
	CaretSortIcon,
	EyeNoneIcon,
} from '@radix-ui/react-icons';
import { Column } from '@tanstack/react-table';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { createContext, useContext } from 'react';
import { CustomButton } from '../custom-button';

export const DataTableColumnHeaderContext = createContext<{
	onlyShowTitle: boolean;
}>({ onlyShowTitle: false });

interface DataTableColumnHeaderProps<TData, TValue>
	extends React.HTMLAttributes<HTMLDivElement> {
	column: Column<TData, TValue>;
	title: string;
}

export function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	className,
}: DataTableColumnHeaderProps<TData, TValue>) {
	const t = useTranslations('ui.dataTable');
	const ctx = useContext(DataTableColumnHeaderContext);

	if (!column.getCanSort() || ctx.onlyShowTitle) {
		return <div className={cn(className)}>{title}</div>;
	}

	return (
		<div className={cn('flex items-center space-x-2', className)}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<CustomButton
						variant="ghost"
						size="sm"
						className="data-[state=open]:bg-accent -ml-3 h-8">
						<span>{title}</span>
						{column.getIsSorted() === 'desc' ? (
							<ArrowDownIcon className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === 'asc' ? (
							<ArrowUpIcon className="ml-2 h-4 w-4" />
						) : (
							<CaretSortIcon className="ml-2 h-4 w-4" />
						)}
					</CustomButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					<DropdownMenuItem onClick={() => column.toggleSorting(false)}>
						<ArrowUpIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
						{t('asc')}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => column.toggleSorting(true)}>
						<ArrowDownIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
						{t('desc')}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
						<EyeNoneIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
						{t('hide')}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
