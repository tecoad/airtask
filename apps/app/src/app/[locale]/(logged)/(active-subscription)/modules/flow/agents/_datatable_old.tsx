'use client';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { MomentDate } from '@/components/moment-date';
import { FlowAgentEditorType, FlowAgentFragment } from '@/core/shared/gql-api-schema';
import { useListFlowAgents } from '@/lib/flow-agent/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

const Page = () => {
	const t = useTranslations('flow.agents');
	const router = useRouter();
	const { data, isLoading } = useListFlowAgents();

	const columns: ColumnDef<FlowAgentFragment>[] = [
		{
			accessorKey: 'title',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.title')}
				/>
			),
			cell: ({ cell }) => <div className="w-[150px]">{cell.row.original.title}</div>,
			enableHiding: true,
			enableSorting: true,
		},
		{
			accessorKey: 'editor_type',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.type.label')}
				/>
			),
			cell: ({ cell }) => {
				const type = cell.row.original.editor_type;
				return (
					<div className="w-[150px]">
						{type === FlowAgentEditorType.Advanced
							? t('column.type.advanced')
							: type == FlowAgentEditorType.Standard
							? t('column.type.standard')
							: t('column.type.form')}
					</div>
				);
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
					title={t('column.lastEdited')}
				/>
			),
			cell: ({ cell }) => (
				<div className="w-[150px]">
					<MomentDate mode="relative" date={new Date(cell.row.original.date_created)} />
				</div>
			),
			enableHiding: true,
			enableSorting: true,
		},
	];

	return (
		<DataTable
			getRowProps={(row) => ({
				className: 'cursor-pointer',
				onClick: () => router.push(`/modules/flow/agents/${row.original.id}/edit`),
			})}
			columns={columns}
			filtersPlaceholder={t('search')}
			clientSearchField="title"
			data={data || []}
			isLoading={isLoading}
		/>
	);
};

export default Page;
