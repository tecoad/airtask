'use client';

import { RequestPasswordResetForm } from '@/components/request-password-reset-form';
import { PasswordResetForm } from '@/components/reset-password-form';
import { useSearchParams } from 'next/navigation';

export const Forms = () => {
	const token = useSearchParams().get('token');

	return token ? <PasswordResetForm /> : <RequestPasswordResetForm />;
};
