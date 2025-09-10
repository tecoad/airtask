'use client';

import { useToggleWithDelay } from '@/core/hooks/useToggleWithDelay';
import { Check, Copy, LucideProps } from 'lucide-react';
import { CustomButton } from './custom-button';
import { ButtonProps } from './ui/button';

type Props = {
	copyText?: string;
	copiedText?: string;
	toggleDelay?: number;
	copyContent: string;

	useOnlyIcon?: boolean;

	extra?: ButtonProps;
	iconProps?: LucideProps;

	onCopy?: () => void;
};

export const CopyButton = ({
	copyText = 'Copy',
	copiedText = 'Copied',
	copyContent,
	toggleDelay,
	useOnlyIcon,
	iconProps,
	extra,
	onCopy,
}: Props) => {
	const [isCopied, setCopied] = useToggleWithDelay(toggleDelay);

	return (
		<CustomButton
			variant="ghost"
			className="h-6 p-2"
			size={useOnlyIcon ? 'icon' : undefined}
			{...extra}
			onClick={async (e) => {
				e.preventDefault();
				e.stopPropagation();

				await navigator.clipboard.writeText(copyContent);

				setCopied(true);

				onCopy?.();
			}}>
			{!useOnlyIcon && (isCopied ? copiedText : copyText)}
			{isCopied ? (
				<Check className="ml-2" size={12} strokeWidth={1.25} {...iconProps} />
			) : (
				<Copy className="ml-2" size={12} strokeWidth={1.25} {...iconProps} />
			)}
		</CustomButton>
	);
};
