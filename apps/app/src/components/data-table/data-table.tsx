'use client';

import {
	ColumnDef,
	ColumnFiltersState,
	PaginationState,
	Row,
	RowSelectionState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Checkbox } from '../ui/checkbox';
import { Skeleton } from '../ui/skeleton';
import { DataTablePagination, ManualPaginationProps } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';

export type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onSorting?: (v: SortingState) => Promise<void> | void;
	onServerSearch?: (v: string) => Promise<void> | void;
	clientSearchField?: keyof TData;
	initialPagination?: PaginationState;
	isLoading?: boolean;
	filters?: React.ReactNode;
	activeFilters?: { [fieldName: string]: unknown };
	onAllFiltersClear?: () => void;
	manualFiltering?: boolean;
	selectingItems?: {
		selectedItems: Row<TData>[];
		/**
		 * Provide this function as a not null value to enable selecting items.
		 */
		onSelectedItemsChange: (items: Row<TData>[]) => void;
	};
	filtersPlaceholder?: string;
	addon?: React.ReactNode;

	getRowProps?: (row: Row<TData>) => Parameters<typeof TableRow>[0];
	getRowLink?: (row: Row<TData>) => string;
} & Omit<ManualPaginationProps, 'hasAnotherPage'>;

const chunks = <D extends any>(a: D[], size: number) =>
	Array.from(new Array(Math.ceil(a.length / size)), (_, i) =>
		a.slice(i * size, i * size + size),
	);

export function DataTable<TData, TValue>({
	columns,
	data,
	isLoading,
	onSorting,
	initialPagination,
	onPagination,
	onServerSearch,
	clientSearchField,
	filtersPlaceholder,
	selectingItems,
	manualFiltering,
	getRowLink,
	onAllFiltersClear,
	getRowProps,
	addon,
	filters,
	activeFilters,
	...manualPagination
}: DataTableProps<TData, TValue>) {
	const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [pagination, setPagination] = React.useState<PaginationState>(
		initialPagination || {
			pageIndex: 0,
			pageSize: 10,
		},
	);

	React.useEffect(() => {
		if (!activeFilters) {
			setColumnFilters([]);
			return;
		}

		setColumnFilters(
			Object.keys(activeFilters).map((v) => ({
				id: v,
				value: activeFilters[v],
			})),
		);
	}, [activeFilters]);

	React.useEffect(() => {
		console.log('the effect');
		if (!selectingItems?.selectedItems) {
			return;
		}

		table.setRowSelection(
			selectingItems.selectedItems.reduce(
				(acc, item) => ({
					...acc,
					[item.id]: true,
				}),
				{},
			),
		);
	}, [selectingItems?.selectedItems]);

	const table = useReactTable({
		data,
		columns,
		state: {
			pagination,
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: async (v) => {
			let value: SortingState;

			if (v instanceof Function) {
				value = v(sorting);
			} else {
				value = v;
			}
			await onSorting?.(value);

			setSorting(v);
		},
		onPaginationChange: (v) => {
			let value: PaginationState;

			if (v instanceof Function) {
				value = v(pagination);
			} else {
				value = v;
			}

			onPagination?.(value);
			setPagination(v);
		},
		manualFiltering,
		manualPagination: manualPagination.manualPagination,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	const rows = table.getRowModel().rows;
	const pages = React.useMemo(() => {
		return chunks(rows, pagination.pageSize);
	}, [data, rows, pagination, pagination.pageSize]);

	// const SkeletonRow = () => (
	// 	<TableRow>
	// 		{columns.map((col, index) => (
	// 			<TableCell key={index}>
	// 				<div className="is-skeleton">&nbsp;</div>
	// 			</TableCell>
	// 		))}
	// 	</TableRow>
	// );

	const t = useTranslations('ui.dataTable');

	return (
		<div className="relative space-y-4">
			<>
				<DataTableToolbar
					filters={filters}
					table={table}
					addon={addon}
					clientSideSearchField={clientSearchField}
					onServerSearch={onServerSearch}
					filtersPlaceholder={filtersPlaceholder}
					onAllFiltersClear={onAllFiltersClear}
				/>
				<div className="overflow-hidden rounded-md border">
					<Table>
						<>
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{selectingItems && (
											<TableHead>
												<div className="flex w-[40px] items-center justify-center">
													<Checkbox
														checked={pages[pagination.pageIndex]?.every((v) =>
															v.getIsSelected(),
														)}
														onCheckedChange={(value) => {
															const page = manualPagination.manualPagination
																? pages[pagination.pageIndex]
																: rows;

															const newRowSelection = {
																...rowSelection,
																...page?.reduce(
																	(acc, row) => {
																		acc[row.id] = !!value;

																		return acc;
																	},
																	{} as Record<string, boolean>,
																),
															};

															selectingItems.onSelectedItemsChange(
																Object.keys(newRowSelection)
																	.filter((k) => newRowSelection[k])
																	.map((v) => rows.find((item) => item.id === v)!),
															);
														}}
														aria-label="Select all"
														className="translate-y-[2px]"
													/>
												</div>
											</TableHead>
										)}
										{headerGroup.headers.map((header) => {
											return (
												<TableHead key={header.id}>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column.columnDef.header,
																header.getContext(),
														  )}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={columns.length + (selectingItems ? 1 : 0)}>
											<Skeleton className="h-9 w-full" />
										</TableCell>
									</TableRow>
								) : // Array.from({ length: 1 }).map((_, k) => <SkeletonRow key={k} />)
								rows?.length ? (
									(manualPagination.manualPagination
										? pages[pagination.pageIndex]
										: rows
									)?.map((row) => {
										const content = (
											<TableRow
												{...getRowProps?.(row)}
												key={row.id}
												data-state={row.getIsSelected() && 'selected'}>
												{selectingItems && (
													<TableCell>
														<div className="flex w-[40px] items-center justify-center">
															<Checkbox
																onClick={(e) => e.stopPropagation()}
																checked={row.getIsSelected()}
																onCheckedChange={(value) => {
																	const newRowSelection = {
																		...rowSelection,
																		[row.id]: !!value,
																	};

																	selectingItems.onSelectedItemsChange(
																		Object.keys(newRowSelection)
																			.filter((k) => newRowSelection[k])
																			.map((v) => rows.find((item) => item.id === v)!),
																	);
																}}
																aria-label="Select row"
																// className="translate-y-[2px]"
															/>
														</div>
													</TableCell>
												)}
												{row.getVisibleCells().map((cell) => (
													<>
														<TableCell key={cell.id}>
															{flexRender(cell.column.columnDef.cell, cell.getContext())}
														</TableCell>
													</>
												))}
											</TableRow>
										);

										return getRowLink ? (
											<Link href={getRowLink(row)} className="contents">
												{content}
											</Link>
										) : (
											content
										);
									})
								) : (
									<TableRow>
										<TableCell colSpan={columns.length} className="h-24 text-center">
											{t('noResults')}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</>
					</Table>
				</div>
				{!isLoading && (
					<DataTablePagination
						isSelectable={!!selectingItems}
						isLoading={isLoading}
						table={table}
						pagination={pagination}
						onPagination={(v) => {
							onPagination?.(v);
							setPagination(v);
						}}
						hasAnotherPage={!!pages[pagination.pageIndex + 1]}
						{...manualPagination}
					/>
				)}
			</>
		</div>
	);
}
