'use client';

import { CustomButton } from '@/components/custom-button';
import PageContent from '@/components/page-content';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { withUserEventData } from '@/core/helpers/gtm';
import { useUser } from '@/lib';
import { useTranslations } from 'next-intl';

import Link from 'next/link';
import { useEffect } from 'react';
import TagManager from 'react-gtm-module-custom-domain';

type Props = {
	params: { checkoutId: string };
};

const Success = ({ params }: Props) => {
	const { user } = useUser();

	const t = useTranslations('success');

	useEffect(() => {
		if (!params.checkoutId || !user) return;

		TagManager.dataLayer({
			dataLayer: {
				event: 'subscribe',
				eventId: params.checkoutId,
				_clear: true,
				...withUserEventData(user),
			},
		});
	}, [user, params.checkoutId]);

	return (
		<PageContent centered>
			<Card className="w-full max-w-[400px] text-center">
				<CardHeader>
					<CardTitle>{t('title')}</CardTitle>

					<CardDescription className="leading-2  break-words">
						#{params.checkoutId}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div>{t('message')}</div>
				</CardContent>
				<CardFooter>
					<Link href="/dashboard" className="w-full">
						<CustomButton className="w-full">{t('goToDashboard')}</CustomButton>
					</Link>
				</CardFooter>
			</Card>
		</PageContent>
	);
};

export default Success;
