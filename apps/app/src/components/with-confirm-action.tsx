import { useDisclosure } from '@/core/hooks/useDisclosure';

import { useTranslations } from 'next-intl';
import { ReactNode, useState } from 'react';
import { CustomButton } from './custom-button';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from './ui/alert-dialog';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog';

type BaseProps = {
	title: string;
	description: ReactNode;
	onConfirm: () => void | Promise<void>;
	children?: ReactNode;
	isActive?: boolean;
	autoCloseOnConfirm?: boolean;
	disclosure?: Omit<ReturnType<typeof useDisclosure>, 'onToggle'> &
		Partial<ReturnType<typeof useDisclosure>>;
	isConfirming?: boolean;
	isConfirmDisabled?: boolean;
	confirmLabel?: string;
};

type AlertProps = {
	isAlert: true;
	cancelLabel?: string;
} & BaseProps;

type NonAlertProps = {
	isAlert?: false;
	content: ReactNode;
} & BaseProps;

type Props = NonAlertProps | AlertProps;

export const WithConfirmAction = (props: Props) => {
	const {
		onConfirm,
		title,
		description,
		children,
		autoCloseOnConfirm = true,
		isConfirming,
		confirmLabel,
		isAlert,
		disclosure,
		isConfirmDisabled,
		isActive,
	} = props;

	const [isLoading, setLoading] = useState(false);
	const fallbackDisclosure = useDisclosure();
	const { onClose, isOpen, onOpen } = disclosure || fallbackDisclosure;

	const Provider = isAlert ? AlertDialog : Dialog,
		Trigger = isAlert ? AlertDialogTrigger : DialogTrigger,
		Content = isAlert ? AlertDialogContent : DialogContent,
		Header = isAlert ? AlertDialogHeader : DialogHeader,
		HeaderTitle = isAlert ? AlertDialogTitle : DialogTitle,
		HeaderDesc = isAlert ? AlertDialogDescription : DialogDescription,
		Footer = isAlert ? AlertDialogFooter : DialogFooter,
		Confirm = isAlert ? AlertDialogAction : CustomButton;

	const t = useTranslations();

	return isActive ? (
		<>
			<Provider
				open={isOpen}
				onOpenChange={(v) => {
					v ? onOpen() : onClose();
				}}>
				{children && <Trigger asChild>{children}</Trigger>}
				<Content className="sm:max-w-[425px]">
					<Header>
						<HeaderTitle className="text-foreground">{title}</HeaderTitle>
						<HeaderDesc>{description}</HeaderDesc>
					</Header>
					{!props.isAlert && props.content}
					<Footer>
						{isAlert && (
							<AlertDialogCancel>
								{props.cancelLabel || t('ui.dismiss')}
							</AlertDialogCancel>
						)}

						<Confirm
							loading={isLoading || isConfirming}
							disabled={isConfirmDisabled}
							onClick={async () => {
								autoCloseOnConfirm && onClose();

								setLoading(true);
								await onConfirm();
								setLoading(false);
							}}>
							{confirmLabel || t('ui.confirm')}
						</Confirm>
					</Footer>
				</Content>
			</Provider>
		</>
	) : (
		children
	);
};
