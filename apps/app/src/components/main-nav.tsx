import Link from 'next/link';

import { cn } from '@/lib/utils';

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
	return (
		<nav className={cn('flex items-center space-x-4 lg:space-x-6', className)} {...props}>
			<Link
				href="/examples/dashboard"
				className="hover:text-primary text-sm font-semibold transition-colors">
				Overview
			</Link>
			<Link
				href="/examples/dashboard"
				className="text-muted-foreground hover:text-primary text-sm font-semibold transition-colors">
				Customers
			</Link>
			<Link
				href="/examples/dashboard"
				className="text-muted-foreground hover:text-primary text-sm font-semibold transition-colors">
				Products
			</Link>
			<Link
				href="/examples/dashboard"
				className="text-muted-foreground hover:text-primary text-sm font-semibold transition-colors">
				Settings
			</Link>
		</nav>
	);
}
