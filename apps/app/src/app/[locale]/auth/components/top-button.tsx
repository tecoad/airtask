import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
	href: string;
	title: string;
}
export const TopButton = ({ href, title }: Props) => {
	return (
		<Link
			href={href}
			className={cn(
				buttonVariants({ variant: 'ghost' }),
				'absolute right-4 top-4 md:right-8 md:top-8',
			)}>
			{title}
		</Link>
	);
};
