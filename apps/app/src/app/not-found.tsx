export const dynamic = 'force-dynamic';

import { BgImages } from '@/components/bg-images';

import { Button404 } from '@/components/button-404';
import PageContent from '@/components/page-content';
import { PageWrapper } from '@/components/page-wrapper';
import { Ban } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function NotFound() {
	const t = useTranslations('404');

	return (
		<>
			<PageWrapper>
				<PageContent centered>
					<div className="flex flex-col items-center gap-4">
						<div className="flex flex-row items-center gap-2 ">
							<Ban size={32} strokeWidth={1.75} />
							<h2 className="text-foreground text-4xl">{t('title')}</h2>
						</div>
						<p>{t('message')}</p>
						<Button404 />
					</div>
				</PageContent>
			</PageWrapper>

			<BgImages />
		</>
	);
}
