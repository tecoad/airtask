import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { Data } from './data';

type Props = {
	params: { id: string };
};

export default function DashboardPage({ params }: Props) {
	const t = useTranslations();
	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader className="card-header">
						<CardTitle className="card-title subtle">
							{t('quotation.overview.totalRequests')}
						</CardTitle>
						<MessageCircle size={20} strokeWidth={1.8} />
					</CardHeader>
					<CardContent className="card-content">
						<Suspense fallback={<div className="is-skeleton">10</div>}>
							<Data id={params.id} />
						</Suspense>
						{/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
