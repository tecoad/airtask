'use client';
import { CustomButton } from '@/components/custom-button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { FullQuotationRequestFragment } from '@/core/shared/gql-api-schema';
import { useToggleRequestCheck } from '@/lib';
import { CheckCircle, ChevronDownIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';

type Props = {
	data?: FullQuotationRequestFragment;
	setData: Dispatch<SetStateAction<Props['data']>>;
	skeletonMode?: boolean;
};

export const ToggleChecked = ({ data, setData, skeletonMode }: Props) => {
	const { isChecking, toggleRequestCheck } = useToggleRequestCheck();
	const toggleAndUpdate = async () => {
		if (!data) return;

		const newData = await toggleRequestCheck(data.id);
		setData(newData);
	};

	const t = useTranslations('quotation.requests');

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<div>
						<CustomButton
							loading={isChecking}
							className={`flex gap-2 rounded-full px-3 ${
								data?.checked_at ? 'bg-green-500 hover:bg-green-400' : ''
							} ${skeletonMode && 'is-skeleton pointer-events-none'}`}>
							<CheckCircle className="h-4 w-4" />
							{t('markAs')}
							<>
								<Separator orientation="vertical" className="h-[20px]" />
								<ChevronDownIcon className="h-4 w-4" />
							</>
						</CustomButton>
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					alignOffset={-5}
					className="w-[200px]"
					forceMount>
					<DropdownMenuLabel>{t('status')}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuCheckboxItem
						checked={!data?.checked_at}
						onClick={() => {
							data?.checked_at && toggleAndUpdate();
						}}>
						{t('pending')}
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem
						checked={!!data?.checked_at}
						onClick={() => {
							!data?.checked_at && toggleAndUpdate();
						}}>
						{t('done')}
					</DropdownMenuCheckboxItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};
