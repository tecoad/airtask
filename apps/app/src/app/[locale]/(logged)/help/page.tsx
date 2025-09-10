import { Metadata } from 'next';

import { ReportAnIssue } from '@/app/[locale]/(logged)/help/components/report-an-issue';
import PageContent from '@/components/page-content';
import { useTranslations } from 'next-intl';

export const metadata: Metadata = {
	title: 'Help',
};

export default function Page() {
	const t = useTranslations('help');

	return (
		<PageContent
			heading={{
				title: t('title'),
				subtitle: t('subtitle'),
				separator: true,
			}}>
			<ReportAnIssue />
		</PageContent>
	);
}
