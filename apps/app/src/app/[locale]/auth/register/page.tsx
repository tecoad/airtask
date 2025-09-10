'use client';

import { UserRegisterForm } from '@/app/[locale]/auth/components/user-register-form';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Title } from '../components/title';
import { TopButton } from '../components/top-button';
import { Wrapper } from '../components/wrapper';

export default function AuthenticationPage() {
	const t = useTranslations('auth');
	const isSuccessful = useSearchParams().get('registered');

	return (
		<>
			<TopButton href="login" title={t('login.title')} />

			<Wrapper>
				<Title
					title={isSuccessful ? t('register.verifyEmail') : t('register.description')}
					subtitle={isSuccessful ? t('register.linkSent') : t('register.instruction')}
				/>

				{!isSuccessful && (
					<>
						<UserRegisterForm />

						<p className="text-muted-foreground px-8 text-center text-sm">
							{t.rich('register.disclaimer', {
								terms: (chunks) => (
									<Link
										href="https://www.airtask.ai/terms-service"
										target="_blank"
										className="hover:text-primary underline underline-offset-4">
										{chunks}
									</Link>
								),
								privacy: (chunks) => (
									<Link
										href="https://www.airtask.ai/privacy"
										target="_blank"
										className="hover:text-primary underline underline-offset-4">
										{chunks}
									</Link>
								),
							})}
						</p>
					</>
				)}
			</Wrapper>
		</>
	);
}
