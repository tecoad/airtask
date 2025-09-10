import { SectionTitle } from '@/components/section-title';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { InstallationCode } from './installation-code/main';
import { PreviewUrl } from './preview-url/main';
import { WidgetLink } from './widget-link/main';

type Props = {
	params: { id: string };
};
export default function Page({ params }: Props) {
	const t = useTranslations('modules.install');

	return (
		<>
			<SectionTitle title={t('embed.title')} subtitle={t('embed.subtitle')} />

			<div>{t.raw('embed.instructions')}</div>

			<Suspense fallback={<div className="is-skeleton h-60"></div>}>
				<Card className="text-foreground/60 relative overflow-hidden p-4">
					<InstallationCode quotationId={params.id} />
				</Card>
			</Suspense>

			<SectionTitle title={t('shareLink.title')} subtitle={t('shareLink.description')} />
			<div className="relative">
				<Suspense fallback={<Input className="is-skeleton w-full" />}>
					<WidgetLink quotationId={params.id} />
				</Suspense>
			</div>
			<div>{t('instructions')}</div>

			<Separator />

			<PreviewUrl quotationId={params.id} />
		</>
	);
}
