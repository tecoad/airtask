'use client';

import {
	RequestResetPasswordFormValues,
	useRequestResetPasswordForm,
	useSetupRequestResetPasswordForm,
} from '@/lib/sign';
import { yupResolver } from '@hookform/resolvers/yup';
import { KeyRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { CustomButton } from './custom-button';
import { InputField } from './forms/input';
import { Form } from './ui/form';

export function RequestPasswordResetForm() {
	const { defaultValues, schema } = useSetupRequestResetPasswordForm();
	const methods = useForm<RequestResetPasswordFormValues>({
		defaultValues,
		resolver: yupResolver(schema as any),
	});
	const {
		formState: { isSubmitting },
	} = methods;
	const { onSubmit, success } = useRequestResetPasswordForm();

	const t = useTranslations('auth.passwordReset');

	return success ? (
		<div className="flex flex-col space-y-2 text-center">
			<p className="text-muted-foreground">{t('linkSend')}</p>
		</div>
	) : (
		<Form {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<InputField
					control={methods.control}
					label={t('email')}
					name="email"
					extra={{
						autoCapitalize: 'none',
						autoComplete: 'email',
						autoCorrect: 'off',
						disabled: isSubmitting,
					}}
				/>

				<CustomButton loading={isSubmitting} className="mt-4" size="lg" type="submit">
					<>
						<KeyRound size={18} strokeWidth={1.75} className="mr-2" />
						{t('recoverPassword')}
					</>
				</CustomButton>
			</form>
		</Form>
	);
}
