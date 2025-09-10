'use client';

import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Table, flexRender } from '@tanstack/react-table';

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { CustomButton } from '../custom-button';
import { DataTableColumnHeaderContext } from './data-table-column-header';

interface DataTableViewOptionsProps<TData> {
	table: Table<TData>;
}

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
	const columnsAvailable = table.getAllColumns().filter((column) => column.getCanHide());

	// Memorize the headers because on hide column the header is removed from the table
	const headers = useMemo(() => {
		return table.getHeaderGroups().flatMap((v) => v.headers);
	}, []);

	const t = useTranslations('ui.dataTable');

	return columnsAvailable.length ? (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<CustomButton variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
					<MixerHorizontalIcon className="mr-2 h-4 w-4" />
					{t('view')}
				</CustomButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[150px]">
				<DropdownMenuLabel>{t('toggleColumns')}</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{columnsAvailable.map((column) => {
					const header = headers.find((item) => item.column.id === column.id)!;

					return (
						<DropdownMenuCheckboxItem
							key={column.id}
							className="capitalize"
							checked={column.getIsVisible()}
							onCheckedChange={(value) => column.toggleVisibility(!!value)}>
							<DataTableColumnHeaderContext.Provider value={{ onlyShowTitle: true }}>
								{header.isPlaceholder
									? null
									: flexRender(header.column.columnDef.header, header.getContext())}
							</DataTableColumnHeaderContext.Provider>
						</DropdownMenuCheckboxItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	) : (
		<></>
	);
}
