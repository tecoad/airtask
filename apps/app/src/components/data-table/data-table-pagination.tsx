import {
	ChevronLeftIcon,
	ChevronRightIcon,
	DoubleArrowLeftIcon,
	DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { PaginationState, Table } from '@tanstack/react-table';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { CustomButton } from '../custom-button';

export type ManualPaginationProps = {
	isLoading?: boolean;
	hasMore?: boolean;
	hasAnotherPage?: boolean;
	totalItems?: number;
	manualPagination?: boolean;
	fetchMore?: (pagination: PaginationState) => Promise<void>;
	fetchToLastPage?: (pagination: PaginationState) => Promise<void>;
	onPagination?: (v: PaginationState) => Promise<void> | void;
};

type DataTablePaginationProps<TData> = {
	table: Table<TData>;
	pagination?: PaginationState;
	isSelectable: boolean;
} & ManualPaginationProps;

export function DataTablePagination<TData>({
	table,
	isSelectable,
	hasMore,
	hasAnotherPage,
	manualPagination,
	isLoading,
	fetchMore,
	fetchToLastPage,
	pagination,
	totalItems,
	onPagination,
}: DataTablePaginationProps<TData>) {
	const totalPages = Math.ceil(totalItems! / pagination!.pageSize);
	const t = useTranslations('ui.dataTable');

	return (
		<>
			<div className="grid w-full grid-cols-[1fr_auto] grid-rows-[auto_auto] gap-4  md:grid-cols-[1fr_auto_auto] md:grid-rows-[auto]">
				<div className="flex items-center ">
					<div className="text-muted-foreground text-sm">
						{isSelectable
							? t('selectedOfTotal', {
									selected: table.getFilteredSelectedRowModel().rows.length,
									total: manualPagination
										? totalItems
										: table.getFilteredRowModel().rows.length,
							  })
							: t('totalItems', {
									total: manualPagination
										? totalItems
										: table.getFilteredRowModel().rows.length,
							  })}
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<p className="text-sm font-semibold">{t('rowsPerPage')}</p>
					<Select
						value={`${table.getState().pagination.pageSize}`}
						onValueChange={(value) => {
							table.setPageIndex(0);
							table.setPageSize(Number(value));

							manualPagination &&
								onPagination?.({
									pageIndex: 0,
									pageSize: Number(value),
								});
						}}>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue placeholder={table.getState().pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{[10, 20, 30, 40, 50].map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="col-span-2 flex justify-center  gap-2 md:col-span-1">
					<div className="flex items-center justify-center text-sm font-semibold">
						{t('pageOf', {
							current: table.getState().pagination.pageIndex + 1,
							last: manualPagination ? totalPages : table.getPageCount(),
						})}
					</div>
					<div className="flex items-center space-x-2">
						<CustomButton
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}>
							<span className="sr-only">Go to first page</span>
							<DoubleArrowLeftIcon className="h-4 w-4" />
						</CustomButton>
						<CustomButton
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}>
							<span className="sr-only">Go to previous page</span>
							<ChevronLeftIcon className="h-4 w-4" />
						</CustomButton>
						<CustomButton
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={async () => {
								if (manualPagination && !hasAnotherPage) {
									await fetchMore?.(pagination!);
								}
								table.nextPage();
							}}
							disabled={
								manualPagination ? !(hasMore || hasAnotherPage) : !table.getCanNextPage()
							}>
							<span className="sr-only">Go to next page</span>
							<ChevronRightIcon className="h-4 w-4" />
						</CustomButton>
						<CustomButton
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={async () => {
								if (manualPagination) {
									const fetchedAllAlready =
										table.getRowModel().rows.length === totalItems;

									!fetchedAllAlready && (await fetchToLastPage?.(pagination!));

									table.setPageIndex(totalPages - 1);

									return;
								}

								table.setPageIndex(table.getPageCount() - 1);
							}}
							disabled={
								manualPagination
									? pagination!.pageIndex + 1 === totalPages
									: !table.getCanNextPage()
							}>
							<span className="sr-only">Go to last page</span>
							<DoubleArrowRightIcon className="h-4 w-4" />
						</CustomButton>
					</div>
				</div>
			</div>
		</>
	);
}
