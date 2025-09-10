'use client';

import { CustomButton } from '@/components/custom-button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FlowFragment } from '@/core/shared/gql-api-schema';
import { useDeleteFlow } from '@/lib/flow/hooks';
import { MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const FlowActions = ({
	item,
	onDelete,
}: {
	item: FlowFragment;
	onDelete: () => void;
}) => {
	const t = useTranslations('flow.campaigns');
	const { deleteFlow } = useDeleteFlow();

	return (
		<div className="flex justify-end">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<CustomButton variant="default" size="icon" className="h-8 w-8 rounded-full">
						<MoreHorizontal size={16} />
					</CustomButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent onClick={(e) => e.stopPropagation()} align="end">
					<DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
					<DropdownMenuItem
						onClick={async () => {
							await deleteFlow(item);
							onDelete();
						}}>
						{t('delete')}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};
