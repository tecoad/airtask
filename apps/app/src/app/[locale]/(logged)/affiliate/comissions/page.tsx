'use client';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import {
	DataTableFacetedFilter,
	FilterOption,
} from '@/components/data-table/data-table-faceted-filter';
import { SectionTitle } from '@/components/section-title';
import {
	AffiliateComissionFragment,
	AffiliateComissionStatus,
	SortOrder,
} from '@/core/shared/gql-api-schema';
import { useListAffiliateComissions } from '@/lib';
import { CheckCircledIcon, StopwatchIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

export type Comissions = {
	id: string;
	amount: number;
	status: 'pending' | 'paid' | 'cancelled';
	date: string;
};

export default function Page() {
	const {
		data,
		fetchData,
		filters,
		isLoading,
		pagination,
		setPagination,
		setFilter,
		setFilters,
		setSort,
	} = useListAffiliateComissions();

	const t = useTranslations('affiliates.comissions');

	const statuses: FilterOption[] = [
		{
			value: AffiliateComissionStatus.Paid,
			label: t('status.paid'),
			icon: CheckCircledIcon,
		},
		{
			value: AffiliateComissionStatus.Pending,
			label: t('status.pending'),
			icon: StopwatchIcon,
		},
	];

	const columns: ColumnDef<AffiliateComissionFragment>[] = [
		{
			accessorKey: 'amount',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title={t('column.amount')} />
			),
			cell: ({ row }) => <div className="w-[80px]">R$ {row.original.amount}</div>,
			enableHiding: false,
		},
		{
			enableSorting: false,
			accessorKey: 'status',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title={t('column.status')} />
			),
			cell: ({ row }) => {
				const status = statuses.find((status) => status.value === row.getValue('status'));

				if (!status) {
					return null;
				}

				return (
					<div className="flex w-[100px] items-center">
						{status.icon && (
							<status.icon className="text-muted-foreground mr-2 h-4 w-4" />
						)}
						<span>{status.label}</span>
					</div>
				);
			},
		},
		{
			accessorKey: 'date_created',
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title={t('column.date')} />
			),
			cell: ({ row }) => (
				<div className="w-[80px]">
					{new Date(row.getValue('date_created')).toLocaleString()}
				</div>
			),
			enableSorting: false,
			enableHiding: false,
		},
	];

	return (
		<>
			<SectionTitle title={t('title')} subtitle={t('subtitle')} separator="bottom" />
			<DataTable
				filters={
					<>
						<DataTableFacetedFilter
							title={t('filterStatus')}
							options={statuses}
							serverFilters={filters.status ? [filters.status] : []}
							onServerFilter={(v) => {
								setFilter('status', v ? (v[0] as AffiliateComissionStatus) : undefined);
							}}
						/>
					</>
				}
				data={data?.items || []}
				activeFilters={filters}
				onAllFiltersClear={() => {
					setFilters({});
				}}
				totalItems={data?.totalItems}
				isLoading={isLoading}
				onSorting={(v) => {
					const sort = v[v.length - 1];

					setSort(sort.id as any, sort.desc ? SortOrder.Desc : SortOrder.Asc);
				}}
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
