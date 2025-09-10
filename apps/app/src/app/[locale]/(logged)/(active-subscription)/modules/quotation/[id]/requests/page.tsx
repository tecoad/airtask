'use client';
import { CustomButton } from '@/components/custom-button';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import {
	DataTableFacetedFilter,
	FilterOption,
} from '@/components/data-table/data-table-faceted-filter';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSub,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarTrigger,
} from '@/components/ui/menubar';
import { FullQuotationRequestFragment, SortOrder } from '@/core/shared/gql-api-schema';
import { useQuotationRequests } from '@/lib';
import { cn } from '@/lib/utils';
import { CheckCircledIcon, StopwatchIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function Page() {
	const t = useTranslations('quotation.requests');

	const statuses = [
		{
			value: true,
			label: t('done'),
			icon: CheckCircledIcon,
		},
		{
			value: false,
			label: t('pending'),
			icon: StopwatchIcon,
		},
	] satisfies FilterOption[];

	const {
		data,
		isLoading,
		fetchData,
		filters,
		setFilter,
		setFilters,
		setSearch,
		setSelected,
		setSelectedAsChecked,
		toggleSingleAsChecked,
		pagination,
		setSort,
		setPagination,
	} = useQuotationRequests();

	const columns: ColumnDef<FullQuotationRequestFragment>[] = [
		{
			id: 'select',
			header: ({ table }) => (
				<div className="w-[40px] ">
					<Checkbox
						checked={table.getIsAllPageRowsSelected()}
						onCheckedChange={(value) => {
							table.toggleAllPageRowsSelected(!!value);

							setSelected(!!value ? (data?.items || []).map((v) => v.id) : []);
						}}
						aria-label="Select all"
						className="translate-y-[2px]"
					/>
				</div>
			),
			cell: ({ row }) => (
				<div>
					<Checkbox
						onClick={(e) => e.stopPropagation()}
						checked={row.getIsSelected()}
						onCheckedChange={(value) => {
							row.toggleSelected(!!value);

							setSelected((prev) =>
								!!value
									? [...prev, row.original.id]
									: prev.filter((item) => item !== row.original.id),
							);
						}}
						aria-label="Select row"
						// className="translate-y-[2px]"
					/>
				</div>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: 'sequential_id',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.id')}
				/>
			),
			cell: ({ row }) => {
				return <div className="w-[150px] ">{row.original.sequential_id}</div>;
			},
			enableHiding: false,
			enableSorting: false,
		},
		{
			accessorKey: 'recipient',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.from')}
				/>
			),
			cell: ({ row }) => {
				return (
					<div className="w-[150px] ">
						{row.original.conversation?.recipient?.first_name}
					</div>
				);
			},
			enableHiding: false,
			enableSorting: false,
		},
		{
			enableHiding: false,
			accessorKey: 'date_created',
			header: ({ column }) => (
				<DataTableColumnHeader
					className="w-[180px] "
					column={column}
					title={t('column.date')}
				/>
			),
			cell: ({ row }) => {
				return (
					<div className="flex items-center">
						{new Date(row.original.date_created).toLocaleString()}
					</div>
				);
			},
		},
		{
			accessorKey: 'checked_at',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title={t('column.status')}
					className="w-[100px] "
				/>
			),
			cell: ({ row }) => {
				const status = statuses.find(
					(status) => status.value === !!row.original.checked_at,
				);

				if (!status) {
					return null;
				}

				return (
					<div className="flex items-center">
						<status.icon className="text-muted-foreground mr-2 h-4 w-4" />
						{status.label}
					</div>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'actions',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title=""
					className="w-[50px] max-w-[50px] "
				/>
			),
			cell: ({ row, cell, column }) => {
				return (
					<div className="flex justify-end">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<CustomButton
									variant="default"
									size="icon"
									className="h-8 w-8 rounded-full">
									<MoreHorizontal size={16} />
								</CustomButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();

										toggleSingleAsChecked(row.original.id);
									}}>
									{row.original.checked_at ? t('setAsPending') : t('setAsDone')}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
	];

	const router = useRouter();
	return (
		<>
			<DataTable
				// getRowLink={(row) => `requests/${row.original.id}`}
				getRowProps={(row) => {
					return {
						className: cn(
							!row.original.visualized_at ? 'bg-background' : 'bg-foreground/10',
							'cursor-pointer',
						),
						onClick: () => {
							router.push(`requests/${row.original.sequential_id}`);
						},
					};
				}}
				filtersPlaceholder={t('search')}
				onServerSearch={setSearch}
				onSorting={(v) => {
					const sort = v[v.length - 1];

					setSort(sort.id as any, sort.desc ? SortOrder.Desc : SortOrder.Asc);
				}}
				activeFilters={filters}
				onAllFiltersClear={() => {
					setFilters({});
				}}
				filters={
					<>
						<Menubar className="h-8">
							<MenubarMenu>
								<MenubarTrigger>{t('edit')}</MenubarTrigger>
								<MenubarContent>
									<MenubarSub>
										<MenubarSubTrigger>{t('changeStatus')}</MenubarSubTrigger>
										<MenubarSubContent>
											{statuses.map((v, k) => (
												<MenubarItem
													key={k}
													onClick={() => {
														setSelectedAsChecked(v.value);
													}}>
													{v.label}
												</MenubarItem>
											))}
										</MenubarSubContent>
									</MenubarSub>
								</MenubarContent>
							</MenubarMenu>
						</Menubar>

						<DataTableFacetedFilter
							title={t('status')}
							options={statuses}
							serverFilters={
								filters.is_checked
									? [statuses.find((item) => item.value === filters.is_checked)!.label]
									: []
							}
							onServerFilter={([v]) => {
								setFilter('is_checked', v);
							}}
						/>
					</>
				}
				data={data?.items || []}
				totalItems={data?.totalItems}
				isLoading={isLoading}
				hasMore={data ? data.items.length < data.totalItems : false}
				initialPagination={pagination}
				manualPagination
				onPagination={setPagination}
				fetchMore={async (v) => {
					await fetchData(
						{
							skip: data?.items.length,
							take: v.pageSize,
						},
						'append',
					);
				}}
				fetchToLastPage={async (v) => {
					await fetchData(
						{
							skip: data?.items.length,
							take: null,
						},
						'append',
					);
				}}
				columns={columns}
			/>
		</>
	);
}
