'use client';

import { CustomButton } from '@/components/custom-button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WithConfirmAction } from '@/components/with-confirm-action';
import { useDisclosure } from '@/core/hooks/useDisclosure';
import { FlowContactSegmentWithMetricsFragment } from '@/core/shared/gql-api-schema';
import { useDeleteFlowContactSegment } from '@/lib/flow-contact-segment/hooks';
import { MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const SegmentActions = (props: {
	item: FlowContactSegmentWithMetricsFragment;
	onDelete: () => void;
}) => {
	const { item } = props;
	const t = useTranslations('flow.segments.actions');
	const { deleteSegment } = useDeleteFlowContactSegment(props);
	const deleteConfirmDisclosure = useDisclosure();

	return (
		<div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
			<WithConfirmAction
				isAlert
				disclosure={deleteConfirmDisclosure}
				onConfirm={async () => {
					await deleteSegment();
				}}
				title={t('confirm')}
				isActive={true}
				description={t('confirmDeleteWithContactsRelated', {
					contactsCount: item.flow_contacts_count,
				})}></WithConfirmAction>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<CustomButton variant="default" size="icon" className="h-8 w-8 rounded-full">
						<MoreHorizontal size={16} />
					</CustomButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>{t('title')}</DropdownMenuLabel>

					<DropdownMenuItem
						asChild
						onClick={async (e) => {
							// Must use dialog
							if (
								item.flow_contacts_count &&
								// If there is a instance, the deleteSegment method will show a custom error
								!item.flow_instances_count
							) {
								deleteConfirmDisclosure.onOpen();
								return;
							}

							await deleteSegment();
						}}>
						<p>{t('delete')}</p>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};
