'use client';

import { CustomButton } from '@/components/custom-button';
import { useVerifyEmail } from '@/lib';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Title } from '../components/title';
import { TopButton } from '../components/top-button';
import { Wrapper } from '../components/wrapper';

export default function Page() {
	const { state, resendCode, resendLoading } = useVerifyEmail();
	const t = useTranslations('auth');
	return (
		<>
			<TopButton href="register" title={t('register.title')} />

			<Wrapper>
				{state === 'expired-code' || state === 'invalid-code' ? (
					<>
						<Title
							title={t('verifyEmail.title')}
							subtitle={
								state === 'expired-code'
									? t('verifyEmail.expiredLink')
									: t('verifyEmail.invalidLink')
							}
						/>

						<CustomButton onClick={resendCode} loading={resendLoading}>
							{t('verifyEmail.resendLink')}
						</CustomButton>
					</>
				) : (
					<div className="flex justify-center">
						<Loader2 size={32} className="animate-spin text-blue-500" />
					</div>
				)}
			</Wrapper>
		</>
	);
}
