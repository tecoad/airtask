'use client';

import { CustomButton } from '@/components/custom-button';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import {
	DataTableFacetedFilter,
	FilterOption,
} from '@/components/data-table/data-table-faceted-filter';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import {
	FlowRecordingFragment,
	NumberFilter,
	SortOrder,
} from '@/core/shared/gql-api-schema';
import { useListFlowRecording } from '@/lib/flow-recording/hooks';
import { useListFlows } from '@/lib/flow/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Player from './components/player';

const Page = () => {
	const t = useTranslations('flow.recordings');
	const [audioPlaying, setAudioPlaying] = useState<FlowRecordingFragment>();

	const durations = [
		{
			label: t('durations.upTo2Minutes'),
			value: '2' as const,
		},
		{
			label: t('durations.2to4Minutes'),
			value: '2-4' as const,
		},
		{
			label: t('durations.4to6Minutes'),
			value: '4-6' as const,
		},
		{
			label: t('durations.above6Minutes'),
			value: '6+' as const,
		},
	] satisfies FilterOption[];

	const nameToFilter: Record<(typeof durations)[number]['value'], NumberFilter> = {
		'2': {
			lte: 120,
		},
		'2-4': {
			gte: 120,
			lte: 240,
		},
		'4-6': {
			gte: 240,
			lte: 360,
		},
		'6+': {
			lte: 360,
		},
	};

	const filterToName = (filter: NumberFilter) => {
		return Object.entries(nameToFilter).find(([key, value]) => {
			return JSON.stringify(value) === JSON.stringify(filter);
		})![0];
	};

	const {
		data,
		isLoading,
		fetchData,
		filters,
		setFilter,
		setFilters,
		setSearch,
		pagination,
		setSort,
		setPagination,
	} = useListFlowRecording();
	const { data: flows, isLoading: isFlowLoading } = useListFlows();

	const columns: ColumnDef<FlowRecordingFragment>[] = [
		{
			accessorKey: 'contact_name',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.contact')}
				/>
			),
			cell: ({ row }) => {
				return <div className="w-[150px]">{row.original.contact_name}</div>;
			},
			enableHiding: true,
			enableSorting: false,
		},
		{
			accessorKey: 'contact_phone',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.number')}
				/>
			),
			cell: ({ row }) => {
				return <div className="w-[150px]">{row.original.contact_phone}</div>;
			},
			enableHiding: true,
			enableSorting: false,
		},
		{
			accessorKey: 'flow',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.campaign')}
				/>
			),
			cell: ({ row }) => {
				return <div className="w-[150px]">{row.original.flow?.name}</div>;
			},
			enableHiding: true,
			enableSorting: false,
		},
		{
			accessorKey: 'type',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.type')}
				/>
			),
			cell: ({ row }) => {
				return <div className="w-[150px]">{row.original.flow?.type}</div>;
			},
			enableHiding: true,
			enableSorting: false,
		},
		{
			accessorKey: 'date_created',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.date')}
				/>
			),
			cell: ({ row }) => {
				return (
					<div className="w-[150px]">
						{new Date(row.original.date_created).toLocaleString()}
					</div>
				);
			},
			enableHiding: true,
			enableSorting: true,
		},
		// {
		// 	accessorKey: 'status',
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader
		// 			column={column}
		// 			className="w-[150px] "
		// 			title={t('column.status')}
		// 		/>
		// 	),
		// 	cell: () => {
		// 		<div className="w-[150px]">Matheus</div>;
		// 	},
		// 	enableHiding: true,
		// 	enableSorting: false,
		// },
		{
			accessorKey: 'duration',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.duration')}
				/>
			),
			cell: ({ row }) => {
				return <div className="w-[150px]">{row.original.duration}</div>;
			},
			enableHiding: true,
			enableSorting: false,
		},
		{
			accessorKey: 'recording',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.recording')}
				/>
			),
			cell: ({ row }) => {
				return (
					<CustomButton
						className="w-[150px]"
						onClick={() => setAudioPlaying(row.original)}>
						Play
					</CustomButton>
				);
			},
			enableHiding: true,
			enableSorting: false,
		},

		// {
		// 	accessorKey: 'transcript',
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader
		// 			column={column}
		// 			className="w-[150px] "
		// 			title={t('column.transcript')}
		// 		/>
		// 	),
		// 	cell: () => {
		// 		<div className="w-[150px]">Matheus</div>;
		// 	},
		// 	enableHiding: true,
		// 	enableSorting: false,
		// },
	];

	return (
		<>
			<DataTable
				columns={columns}
				data={data?.items || []}
				totalItems={data?.totalItems}
				isLoading={isLoading}
				hasMore={data ? data.items.length < data.totalItems : false}
				initialPagination={pagination}
				manualPagination
				manualFiltering
				onPagination={setPagination}
				onServerSearch={setSearch}
				filtersPlaceholder={t('search')}
				onSorting={(v) => {
					const sort = v[v.length - 1];

					setSort(sort.id as any, sort.desc ? SortOrder.Desc : SortOrder.Asc);
				}}
				activeFilters={filters}
				onAllFiltersClear={() => {
					setFilters({});
				}}
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
				filters={
					<>
						<CalendarDateRangePicker
							date={
								filters.date_created
									? {
											from: filters.date_created?.gte ?? filters.date_created?.gt,
											to: filters.date_created?.lte ?? filters.date_created?.lt,
									  }
									: undefined
							}
							onNewDate={(date) => {
								setFilter(
									'date_created',
									date
										? {
												gte: date.from,
												lte: date.to,
										  }
										: undefined,
								);
							}}
						/>

						<DataTableFacetedFilter
							title={t('campaign')}
							options={
								flows?.map((v) => ({
									label: v.name,
									value: v.id,
								})) || []
							}
							serverFilters={filters.flow ? [filters.flow] : []}
							onServerFilter={([v]) => {
								setFilter('flow', v);
							}}
						/>

						<DataTableFacetedFilter
							title={t('duration')}
							options={durations}
							serverFilters={filters.duration ? [filterToName(filters.duration)] : []}
							onServerFilter={([v]) => {
								setFilter('duration', nameToFilter[v]);
							}}
						/>

						{/* <DataTableFacetedFilter
							title={t('status')}
							options={[
								{
									label: 'Pickup',
									value: 'pickup',
								},
								{
									label: 'DNC',
									value: 'dnc',
								},
								{
									label: 'Has Actions',
									value: 'has-actions',
								},
							]}
							serverFilters={[]}
						/> */}
					</>
				}
			/>

			<Player
				audio={
					audioPlaying
						? {
								src: audioPlaying.record.url,
								secondsDuration: audioPlaying.duration,
						  }
						: undefined
				}
				onClose={() => setAudioPlaying(undefined)}
			/>
		</>
	);
};

export default Page;
