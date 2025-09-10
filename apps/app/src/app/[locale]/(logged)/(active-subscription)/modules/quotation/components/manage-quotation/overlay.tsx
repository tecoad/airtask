import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { useIsMounted } from '@/core/hooks/useIsMounted';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';
import { CustomButton } from '../../../../../../../../components/custom-button';
import { ScrollArea } from '../../../../../../../../components/ui/scroll-area';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;

	title: string;
}

export const Overlay = ({ title, isOpen, onClose, children }: Props) => {
	const mounted = useIsMounted();
	const t = useTranslations('quotation.edit');

	return (
		mounted &&
		isOpen && (
			<Sheet
				open={isOpen}
				modal={false}
				onOpenChange={(isOpen) => {
					!isOpen && onClose();
				}}>
				<SheetContent
					className="flex w-full !max-w-none flex-col gap-0 overflow-y-scroll   p-0 lg:w-[50%]"
					side="left">
					<SheetHeader className="p-5">
						<SheetTitle>{title}</SheetTitle>
					</SheetHeader>
					<ScrollArea className="bg-foreground/5 relative top-0 flex-grow">
						<div className="overflow-visible p-5">{children}</div>
					</ScrollArea>
					<SheetFooter className="p-5">
						<SheetClose asChild>
							<CustomButton onClick={onClose}>{t('save')}</CustomButton>
						</SheetClose>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		)
	);
};
