import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

type Props = {
	url: string;
	children: ReactNode;
	isLocked?: boolean;
	lockedMessage?: string;
};

export const WithLockLink = ({ url, isLocked, lockedMessage, children }: Props) => {
	const content = (
		<div className={cn('flex gap-1', isLocked && 'opacity-70')}>
			<p>{children}</p>
			<ExternalLinkIcon className="m-x-[2px]" />
		</div>
	);

	return isLocked ? (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>{content}</TooltipTrigger>
				<TooltipContent>{lockedMessage}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	) : (
		<Link href={url}>{content}</Link>
	);
};
