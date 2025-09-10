'use client';

import { CustomButton } from '@/components/custom-button';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import {
	DataTableFacetedFilter,
	FilterOption,
} from '@/components/data-table/data-table-faceted-filter';
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
import { formatPrice } from '@/core';
import { CONSTANTS } from '@/core/config/constants';
import { FlowFragment, FlowStatus, FlowType } from '@/core/shared/gql-api-schema';
import { useUser } from '@/lib';
import { useListFlows } from '@/lib/flow/hooks';
import { CheckCircledIcon, StopwatchIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';
import { PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FlowActions } from './components/actions';
import { EditOrCreateNewFlow } from './components/edit-or-create-new';

const Page = () => {
	const t = useTranslations('flow.campaigns');
	const {
		data,
		isLoading,
		addToList,
		removeItemFromList,
		updateItemAtList,
		selected,
		setSelected,
		filters,
		setFilter,
		updateSelectedItems,
	} = useListFlows();
	const { accountSelected } = useUser();
	const statuses = [
		{
			value: FlowStatus.Active,
			label: t('active'),
			icon: CheckCircledIcon,
		},
		{
			value: FlowStatus.Paused,
			label: t('paused'),
			icon: StopwatchIcon,
		},
		{
			value: FlowStatus.Stopped,
			label: t('stopped'),
			userCantSelect: true,
			icon: StopwatchIcon,
		},
	] satisfies (FilterOption & {
		userCantSelect?: boolean;
	})[];

	const columns: ColumnDef<FlowFragment>[] = [
		{
			accessorKey: 'name',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.name')}
				/>
			),
			cell: ({ cell }) => {
				return <div className="w-[150px]">{cell.row.original.name}</div>;
			},
			enableHiding: true,
			enableSorting: true,
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
			cell: ({ cell }) => {
				const { type } = cell.row.original;
				return (
					<div className="w-[150px]">
						{type === FlowType.Inbound ? t('inbound') : t('outbound')}
					</div>
				);
			},
			enableHiding: true,
			enableSorting: false,
		},
		{
			accessorKey: 'daily_budget',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.dailyBudget')}
				/>
			),
			cell: ({ cell }) => {
				return (
					<div className="w-[150px]">
						{formatPrice(
							accountSelected?.account.currency!,
							cell.row.original.daily_budget,
						)}
					</div>
				);
			},
			enableHiding: true,
			enableSorting: true,
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
			cell: ({ cell }) => {
				const status = statuses.find((item) => item.value === cell.row.original.status)!;
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
		{
			accessorKey: 'segment',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.segment')}
				/>
			),
			cell: ({ cell }) => {
				return <div className="w-[150px]">{cell.row.original.segment?.label}</div>;
			},
			enableHiding: true,
			enableSorting: false,
		},
		{
			accessorKey: 'agent',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-[150px] "
					title={t('column.agent')}
				/>
			),
			cell: ({ cell }) => {
				return <div className="w-[150px]">{cell.row.original.agent.title}</div>;
			},
			enableHiding: false,
			enableSorting: false,
		},

		// {
		// 	accessorKey: 'dails',
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader
		// 			column={column}
		// 			className="w-[150px] "
		// 			title={t('column.dials')}
		// 		/>
		// 	),
		// 	cell: () => {
		// 		<div className="w-[150px]">Matheus</div>;
		// 	},
		// 	enableHiding: true,
		// 	enableSorting: true,
		// },

		// {
		// 	accessorKey: 'pickups',
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader
		// 			column={column}
		// 			className="w-[150px] "
		// 			title={t('column.pickups')}
		// 		/>
		// 	),
		// 	cell: () => {
		// 		<div className="w-[150px]">Matheus</div>;
		// 	},
		// 	enableHiding: true,
		// 	enableSorting: true,
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
			cell: ({ cell }) => {
				return (
					<FlowActions
						item={cell.row.original}
						onDelete={() => {
							removeItemFromList(cell.row.original);
						}}
					/>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
	];

	const router = useRouter();
	const pathname = usePathname();
	const queryParams = useSearchParams();
	const [isCreatingNew, setCreatingNew] = useState(
		!!queryParams.get(CONSTANTS.queryParams.createNewDefaultOpen),
	);
	const [itemOnEdit, setItemOnEdit] = useState<FlowFragment>();
	const onEditOrCreateClose = () => {
		setItemOnEdit(undefined);
		setCreatingNew(false);

		if (queryParams.get(CONSTANTS.queryParams.createNewDefaultOpen)) {
			router.push(pathname);
		}
	};

	return (
		<>
			<EditOrCreateNewFlow
				isOpen={isCreatingNew || !!itemOnEdit}
				onClose={onEditOrCreateClose}
				onCreate={(item) => {
					addToList(item);
					onEditOrCreateClose();
				}}
				onUpdate={(item) => {
					updateItemAtList(item);
					onEditOrCreateClose();
				}}
				item={itemOnEdit}
			/>
			<DataTable
				activeFilters={filters}
				selectingItems={{
					selectedItems: selected,
					onSelectedItemsChange: setSelected,
				}}
				columns={columns}
				data={data || []}
				isLoading={isLoading}
				getRowProps={(row) => ({
					className: 'cursor-pointer',
					onClick: () => setItemOnEdit(row.original),
				})}
				addon={
					<CustomButton className="h-8" onClick={() => setCreatingNew(true)}>
						<PlusCircle size={16} className="mr-2" />
						{t('create')}
					</CustomButton>
				}
				filtersPlaceholder={t('search')}
				filters={
					<>
						<Menubar className="h-8">
							<MenubarMenu>
								<MenubarTrigger>{t('edit')}</MenubarTrigger>
								<MenubarContent>
									<MenubarSub>
										<MenubarSubTrigger>{t('changeStatus')}</MenubarSubTrigger>
										<MenubarSubContent>
											{statuses
												.filter((item) => !item.userCantSelect)
												.map((v) => (
													<MenubarItem
														key={v.value}
														onClick={() => {
															updateSelectedItems({
																status: v.value,
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
							serverFilters={[filters.status]}
							onServerFilter={([status]) => {
								setFilter('status', status);
							}}
						/>
					</>
				}
			/>
		</>
	);
};

export default Page;
