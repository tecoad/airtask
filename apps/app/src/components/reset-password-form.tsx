'use client';

import {
	ResetPasswordFormValues,
	useResetPasswordForm,
	useSetupResetPasswordForm,
} from '@/lib/sign';
import { yupResolver } from '@hookform/resolvers/yup';
import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { CustomButton } from './custom-button';
import { InputField } from './forms/input';
import { Form } from './ui/form';

export function PasswordResetForm() {
	const { defaultValues, schema } = useSetupResetPasswordForm();
	const methods = useForm<ResetPasswordFormValues>({
		defaultValues,
		resolver: yupResolver(schema as any),
		mode: 'onSubmit',
	});
	const {
		formState: { isSubmitting },
	} = methods;
	const { onSubmit } = useResetPasswordForm();

	const t = useTranslations('auth.passwordReset');

	return (
		<Form {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<InputField
					control={methods.control}
					label={t('newPassword')}
					name="newPassword"
					type="password"
					extra={{
						disabled: isSubmitting,
					}}
				/>

				<InputField
					control={methods.control}
					label={t('confirmNewPassword')}
					name="confirmPassword"
					type="password"
					extra={{
						disabled: isSubmitting,
					}}
				/>

				<CustomButton loading={isSubmitting} className="mt-4" size="lg" type="submit">
					<>
						<Lock size={18} strokeWidth={1.75} className="mr-2" />
						{t('changePassword')}
					</>
				</CustomButton>
			</form>
		</Form>
	);
}
