'use client';

import { CustomButton } from '@/components/custom-button';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import {
	DataTableFacetedFilter,
	FilterOption,
} from '@/components/data-table/data-table-faceted-filter';
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
import { formatNumber } from '@/core';
import {
	FlowContactFragment,
	FlowContactStatus,
	SortOrder,
	ToggleFlowContactInSegmentMode,
} from '@/core/shared/gql-api-schema';
import { useListFlowContactSegments } from '@/lib/flow-contact-segment/hooks';
import { useListFlowContacts } from '@/lib/flow-contact/hooks';
import { CheckCircledIcon, StopwatchIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';
import { PhoneNumberFormat } from 'google-libphonenumber';
import { MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ImportDialog from './components/import/dialog';

const Page = () => {
	const t = useTranslations('flow.contacts');

	const statuses = [
		{
			value: FlowContactStatus.Active,
			label: t('active'),
			icon: CheckCircledIcon,
		},
		{
			value: FlowContactStatus.Inactive,
			label: t('inactive'),
			icon: StopwatchIcon,
		},
	] satisfies FilterOption[];

	const { data: flowSegments, isLoading: isFlowSegmentsLoading } =
		useListFlowContactSegments();
	const {
		data,
		isLoading,
		fetchData,
		filters,
		setFilter,
		setFilters,
		setSearch,
		selected,
		setSelected,
		pagination,
		setSort,
		setPagination,
		updateItems,
		toggleInSegment,
	} = useListFlowContacts();

	const columns: ColumnDef<FlowContactFragment>[] = [
		{
			accessorKey: 'first_name',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.firstname')}
				/>
			),
			cell: ({ row }) => {
				return <div className="w-[150px]">{row.original.first_name}</div>;
			},
			enableHiding: true,
			enableSorting: false,
		},
		{
			accessorKey: 'last_name',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.lastname')}
				/>
			),
			cell: ({ row }) => {
				return <div className="w-[150px]">{row.original.last_name}</div>;
			},
			enableHiding: true,
			enableSorting: false,
		},
		{
			accessorKey: 'email',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.email')}
				/>
			),
			cell: ({ row }) => {
				return <div className="w-[150px]">{row.original.email}</div>;
			},
			enableHiding: true,
			enableSorting: false,
		},

		{
			accessorKey: 'phone',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.phone')}
				/>
			),
			cell: ({ row }) => {
				return (
					<div className="w-[150px]">
						{formatNumber(row.original.phone, PhoneNumberFormat.INTERNATIONAL)}
					</div>
				);
			},
			enableHiding: true,
			enableSorting: false,
		},
		{
			accessorKey: 'segments',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.segments')}
				/>
			),
			cell: ({ row }) => {
				return (
					<div className="w-[150px]">
						{row.original.segments.map((v) => v.label).join(', ')}
					</div>
				);
			},
			enableHiding: true,
			enableSorting: false,
		},
		{
			accessorKey: 'status',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.status')}
				/>
			),
			cell: ({ row }) => {
				const status = statuses.find((item) => item.value === row.original.status)!;
				return (
					<div className="flex items-center">
						<status.icon className="text-muted-foreground mr-2 h-4 w-4" />
						{status.label}
					</div>
				);
			},
			enableHiding: true,
			enableSorting: false,
		},
		// {
		// 	accessorKey: 'metadata',
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader
		// 			column={column}
		// 			className="w-[150px] "
		// 			title={t('column.metadata')}
		// 		/>
		// 	),
		// 	cell: () => {
		// 		<div className="w-[150px]">Matheus</div>;
		// 	},
		// 	enableHiding: true,
		// 	enableSorting: false,
		// },

		{
			id: 'actions',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					title=""
					className="w-[50px] max-w-[50px] "
				/>
			),
			cell: ({ row }) => {
				const status = row.original.status;
				const diffStatus = statuses.find((item) => item.value !== status)!;
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
									onClick={() => {
										updateItems(
											{
												status: diffStatus.value,
											},
											[row.original.id],
										);
									}}>
									{t('setAsStatus', {
										status: diffStatus.value,
									})}
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

	return (
		<DataTable
			columns={columns}
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
			addon={<ImportDialog />}
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
			selectingItems={{
				selectedItems: selected,
				onSelectedItemsChange: setSelected,
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
													updateItems({
														status: v.value,
													});
												}}>
												{v.label}
											</MenubarItem>
										))}
									</MenubarSubContent>
								</MenubarSub>
								<MenubarSub>
									<MenubarSubTrigger>{t('addToSegment')}</MenubarSubTrigger>
									<MenubarSubContent>
										{flowSegments?.map((v, k) => (
											<MenubarItem
												key={k}
												onClick={() => {
													toggleInSegment({
														mode: ToggleFlowContactInSegmentMode.Add,
														segmentId: v.id,
													});
												}}>
												{v.label}
											</MenubarItem>
										))}
									</MenubarSubContent>
								</MenubarSub>
								<MenubarSub>
									<MenubarSubTrigger>{t('removeFromSegment')}</MenubarSubTrigger>
									<MenubarSubContent>
										{flowSegments?.map((v, k) => (
											<MenubarItem
												key={k}
												onClick={() => {
													toggleInSegment({
														mode: ToggleFlowContactInSegmentMode.Remove,
														segmentId: v.id,
													});
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
							filters.status
								? [statuses.find((item) => item.value === filters.status)!.label]
								: []
						}
						onServerFilter={([v]) => {
							setFilter('status', v);
						}}
					/>

					{flowSegments && (
						<DataTableFacetedFilter
							title={t('segment')}
							options={flowSegments.map((v) => ({
								label: v.label,
								value: v.id,
							}))}
							serverFilters={
								filters.segment
									? [flowSegments.find((item) => item.id === filters.segment)!.label]
									: []
							}
							onServerFilter={([v]) => {
								setFilter('segment', v);
							}}
						/>
					)}
				</>
			}
		/>
	);
};

export default Page;
