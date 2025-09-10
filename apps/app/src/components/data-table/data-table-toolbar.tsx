'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';

import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from './data-table-view-options';

import { useGlobalEvents } from '@/core/contexts/global-events';
import { useDebounce } from '@/core/hooks/useDebounce';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';
import { CustomButton } from '../custom-button';

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	filters?: ReactNode;
	addon?: ReactNode;

	clientSideSearchField?: keyof TData;
	onServerSearch?: (value: string) => Promise<void> | void;
	onClearAllFilters?: () => void;
	filtersPlaceholder?: string;

	onAllFiltersClear?: () => void;
}

export function DataTableToolbar<TData>({
	table,
	filters,
	clientSideSearchField,
	filtersPlaceholder,
	onAllFiltersClear,
	onServerSearch,
	addon,
}: DataTableToolbarProps<TData>) {
	const columnFilters = table.getState().columnFilters;
	const isFiltered = columnFilters.length > 0;

	const [search, setSearch] = useDebounce<string>('', onServerSearch);
	const { emit } = useGlobalEvents();

	const t = useTranslations('ui');

	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				{filters}
				{isFiltered && onAllFiltersClear && (
					<CustomButton
						variant="ghost"
						onClick={() => {
							table.resetColumnFilters();
							onAllFiltersClear();
							emit('data-table.allFiltersRemoved', undefined);
						}}
						className="h-8 px-2 lg:px-3">
						Reset
						<Cross2Icon className="ml-2 h-4 w-4" />
					</CustomButton>
				)}

				{clientSideSearchField || onServerSearch ? (
					<Input
						placeholder={filtersPlaceholder}
						value={
							clientSideSearchField
								? (table
										.getColumn(clientSideSearchField as any)
										?.getFilterValue() as string)
								: search
						}
						onChange={(event) => {
							if (clientSideSearchField) {
								table
									.getColumn(clientSideSearchField as any)
									?.setFilterValue(event.target.value);
							}

							if (onServerSearch) {
								setSearch(event.target.value);
							}
						}}
						className="h-8 flex-grow"
					/>
				) : (
					// Spacer
					<div className="flex-grow" />
				)}

				<DataTableViewOptions table={table} />

				{addon}
			</div>
		</div>
	);
}
