import PageContent from '@/components/page-content';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { CurrentPlan } from './components/current-plan';
import { ExtraCredits } from './components/extra-credits';
import { BillingSkeleton } from './components/skeleton';

export default function Page() {
	const t = useTranslations();

	return (
		<>
			<PageContent
				heading={{ title: t('billing.title'), subtitle: t('billing.subtitle') }}>
				<div className="grid gap-4 md:grid-cols-2">
					<Suspense fallback={<BillingSkeleton />}>
						<CurrentPlan />
					</Suspense>
					<Suspense fallback={<BillingSkeleton />}>
						<ExtraCredits />
					</Suspense>
				</div>
				{/* <Suspense fallback={<BillingSkeleton />}>
					<Usages />
				</Suspense> */}
			</PageContent>
		</>
	);
}
