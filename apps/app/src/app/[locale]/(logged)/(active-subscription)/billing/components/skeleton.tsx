import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const BillingSkeleton = () => {
	return (
		<Card>
			<CardHeader className="card-header">
				<CardTitle className="is-skeleton card-title">Loading</CardTitle>
				<Skeleton className="h-6 w-6 rounded-full" />
			</CardHeader>
			<CardContent className="card-content">
				<span className={` is-skeleton text-xl font-semibold`}>Loading</span>

				<Badge className="!bg-foreground/10 animate-pulse !text-transparent">
					Loading
				</Badge>
			</CardContent>
			<CardFooter className="card-footer">
				<Skeleton className="h-10 w-full" />
			</CardFooter>
		</Card>
	);
};
