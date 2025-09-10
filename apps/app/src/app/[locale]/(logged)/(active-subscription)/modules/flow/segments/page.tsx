'use client';

import { CustomButton } from '@/components/custom-button';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { CONSTANTS } from '@/core/config/constants';
import { FlowContactSegmentWithMetricsFragment } from '@/core/shared/gql-api-schema';
import { useListFlowContactSegmentsWithMetrics } from '@/lib/flow-contact-segment/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { EditSegment } from './components/item';
import { SegmentActions } from './components/segment-actions';

const Page = () => {
	const t = useTranslations('flow.segments');
	const { data, isLoading, removeItemFromList, updateItemAtList, addToList } =
		useListFlowContactSegmentsWithMetrics();

	const columns: ColumnDef<FlowContactSegmentWithMetricsFragment>[] = [
		{
			accessorKey: 'label',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[300px] "
					title={t('column.label')}
				/>
			),
			cell: ({ cell }) => (
				<>
					<div>{cell.row.original.label}</div>
				</>
			),
			enableHiding: true,
			enableSorting: true,
		},
		{
			accessorKey: 'flow_contacts_count',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.flow_contacts_count')}
				/>
			),
			cell: ({ cell }) => {
				return <div className="w-[150px]">{cell.row.original.flow_contacts_count}</div>;
			},
			enableHiding: true,
			enableSorting: true,
		},
		{
			accessorKey: 'flow_instances_count',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.flow_instances_count')}
				/>
			),
			cell: ({ cell }) => (
				<div className="w-[150px]">{cell.row.original.flow_instances_count}</div>
			),
			enableHiding: true,
			enableSorting: true,
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
			cell: ({ row }) => {
				return (
					<SegmentActions
						item={row.original}
						onDelete={() => {
							removeItemFromList(row.original);
						}}
					/>
				);
			},
			enableHiding: false,
		},
	];

	const queryParams = useSearchParams();
	const router = useRouter();
	const [editItem, setEditItem] = useState<FlowContactSegmentWithMetricsFragment>();
	const [isCreatingNew, setCreatingNew] = useState(
		!!queryParams.get(CONSTANTS.queryParams.createNewDefaultOpen),
	);

	return (
		<>
			<EditSegment
				item={editItem}
				isCreatingNew={isCreatingNew}
				onUpdate={(item) => {
					setEditItem(undefined);
					updateItemAtList(item);
				}}
				onCreate={(item) => {
					setCreatingNew(false);
					addToList(item);
					const redirect = queryParams.get(CONSTANTS.queryParams.redirect);

					if (redirect) router.push(redirect);
				}}
				onClose={() => {
					setCreatingNew(false);
					setEditItem(undefined);
				}}
			/>
			<DataTable
				addon={
					<CustomButton
						className="h-8"
						onClick={() => {
							setCreatingNew(true);
						}}>
						<Plus size={16} className="mr-2" />
						{t('createNew')}
					</CustomButton>
				}
				getRowProps={(row) => ({
					className: 'cursor-pointer',
					onClick: () => setEditItem(row.original),
				})}
				columns={columns}
				filtersPlaceholder={t('search')}
				clientSearchField="label"
				data={data || []}
				isLoading={isLoading}
			/>
		</>
	);
};

export default Page;
