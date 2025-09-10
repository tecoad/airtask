'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Title } from '../components/title';
import { TopButton } from '../components/top-button';
import { UserLoginForm } from '../components/user-login-form';
import { Wrapper } from '../components/wrapper';

export default function AuthenticationPage() {
	const t = useTranslations('auth');
	const shouldVerifyEmail = useSearchParams().get('verifyEmail') === 'true';

	return (
		<>
			<TopButton href="register" title={t('register.title')} />

			<Wrapper>
				<Title
					title={shouldVerifyEmail ? t('register.verifyEmail') : t('login.description')}
					subtitle={shouldVerifyEmail ? t('register.linkSent') : t('login.instruction')}
				/>
				{!shouldVerifyEmail && <UserLoginForm />}
			</Wrapper>
		</>
	);
}
