import AsideContent from '@/components/aside-content';
import { useTranslations } from 'next-intl';

interface LayoutProps {
	children: React.ReactNode;
	params: { id: string };
}

export default function Layout({ children, params }: LayoutProps) {
	const basePath = `/modules/quotation/${params.id}`;

	const t = useTranslations('quotation');

	const tabData = [
		{ href: `${basePath}/overview`, title: t('sidenav.overview') },
		{ href: `${basePath}/edit`, title: t('sidenav.edit') },
		{ href: `${basePath}/instructions`, title: t('sidenav.promptInstructions') },
		{ href: `${basePath}/settings`, title: t('sidenav.settings') },
		{ href: `${basePath}/widget`, title: t('sidenav.widget') },
		{ href: `${basePath}/install`, title: t('sidenav.install') },
		{ href: `${basePath}/requests`, title: t('sidenav.requests') },
	];

	return (
		<>
			{/* <div>
				<Suspense fallback={<Title title="Lorem ipsum dolor" skeletonMode separator />}>
					<QuotationTitle id={params.id} />
				</Suspense>
			</div> */}

			<AsideContent items={tabData}>{children}</AsideContent>
		</>
	);
}
