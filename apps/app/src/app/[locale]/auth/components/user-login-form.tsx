'use client';

import { CustomButton } from '@/components/custom-button';
import { InputField } from '@/components/forms/input';
import { Form } from '@/components/ui/form';
import { LoginFormValues, useLoginForm, useSetupLoginForm } from '@/lib/sign';
import { yupResolver } from '@hookform/resolvers/yup';
import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import * as React from 'react';
import { useForm } from 'react-hook-form';

interface UserLoginFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserLoginForm({ className, ...props }: UserLoginFormProps) {
	const { defaultValues, schema } = useSetupLoginForm();
	const methods = useForm<LoginFormValues>({
		defaultValues,
		resolver: yupResolver(schema as any),
		mode: 'onSubmit',
	});
	const {
		formState: { errors, isSubmitting },
	} = methods;
	const { onSubmit } = useLoginForm(methods);

	const t = useTranslations('auth.login');

	return (
		<div {...props}>
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

					<InputField
						control={methods.control}
						label={t('password')}
						name="password"
						type="password"
						extra={{
							autoCapitalize: 'none',
							autoComplete: 'password',
							autoCorrect: 'off',
							disabled: isSubmitting,
						}}
					/>

					<CustomButton loading={isSubmitting} className="mt-4" size="lg" type="submit">
						<>
							<Lock size={18} strokeWidth={1.75} className="mr-2" />
							{t('button')}
						</>
					</CustomButton>
					<div className="item-center flex justify-center ">
						<Link className="text-sm" href="password-reset">
							{t('forgotPassword')}
						</Link>
					</div>
				</form>
			</Form>
		</div>
	);
}
