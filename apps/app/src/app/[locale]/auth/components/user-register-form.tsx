'use client';

import * as React from 'react';

import { Lock } from 'lucide-react';

import { CustomButton } from '@/components/custom-button';
import { InputField } from '@/components/forms/input';
import { RowGrid } from '@/components/forms/row-grid';
import { Form } from '@/components/ui/form';
import { RegisterFormValues, useRegisterForm, useSetupRegisterForm } from '@/lib';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

interface UserRegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserRegisterForm({ className, ...props }: UserRegisterFormProps) {
	const t = useTranslations('auth.register');
	const { defaultValues, schema } = useSetupRegisterForm();
	const methods = useForm<RegisterFormValues>({
		defaultValues,
		resolver: yupResolver(schema as any),
		mode: 'onSubmit',
	});
	const {
		formState: { isSubmitting },
	} = methods;

	const { onSubmit } = useRegisterForm(methods);

	return (
		<div {...props}>
			<Form {...methods}>
				<form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<RowGrid>
						<InputField
							control={methods.control}
							label={t('firstname')}
							name="firstName"
							extra={{
								autoCapitalize: 'none',
								autoComplete: 'firstname',
								autoCorrect: 'off',
								disabled: isSubmitting,
							}}
						/>

						<InputField
							control={methods.control}
							label={t('lastname')}
							name="lastName"
							extra={{
								autoCapitalize: 'none',
								autoComplete: 'lastname',
								autoCorrect: 'off',
								disabled: isSubmitting,
							}}
						/>
					</RowGrid>
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

					<CustomButton type="submit" loading={isSubmitting} className="mt-4" size="lg">
						<Lock size={18} strokeWidth={1.75} className="mr-2" />
						{t('button')}
					</CustomButton>
				</form>
			</Form>
		</div>
	);
}
