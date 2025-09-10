'use client';

import { apiClient } from '@/core';
import {
	ActiveUserFragment,
	UpdateUserInput,
	UpdateUserMutation,
	UpdateUserMutationVariables,
	UserAccountFragment,
	UserAuthErrorCode,
} from '@/core/shared/gql-api-schema';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import * as Yup from 'yup';
import { UPDATE_USER } from './api-gql';
import { useUser } from './context';

const accountConfigMandatoryFields: (keyof UserAccountFragment['account'])[] = [
	'name',
	'description',
	'segment',
];

export const useAccountRedirects = (
	kind: ('setup_account_config' | 'active_subscription')[],
) => {
	const { accountSelected, isUserLoading } = useUser();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (isUserLoading) return;

		// first we look at active subscription redirect
		if (kind.includes('active_subscription')) {
			if (!accountSelected?.account.active_subscription) {
				router.push('/plans');
				return;
			}
		}

		// then at incomplete account config redirect
		if (kind.includes('setup_account_config')) {
			const isSomeConfigNeed =
				accountSelected &&
				accountConfigMandatoryFields.some((field) => !accountSelected?.account[field]);

			if (isSomeConfigNeed) {
				router.push(`/setup-account?redirect=${pathname}`);
				return;
			}
		}
	}, [isUserLoading, accountSelected?.account?.id, kind]);
};

export type UserSettingsFormValues = UpdateUserInput & {
	confirm_password?: string;
};

export const useSetupUserSettingsForm = () => {
	const t = useTranslations('settings.errors.user');

	const { user } = useUser();
	const defaultValues = useMemo<UserSettingsFormValues>(() => ({}), []);

	const schema = useMemo(() => {
		return Yup.object({
			old_password: Yup.string()
				.when('password', {
					is: (val?: string) => !!val?.trim(),
					then(schema) {
						return schema.required();
					},
				})
				.when('email', {
					is: (val?: string) => user?.email !== val,
					then(schema) {
						return schema.required(t('currentPassword'));
					},
				}),
			confirm_password: Yup.string().when('password', {
				is: (val?: string) => !!val?.trim(),
				then(schema) {
					return schema
						.required(t('mandatory'))
						.oneOf([Yup.ref('password')], t('passwordsDontMatch'));
				},
			}),
			email: Yup.string().email(t('emailInvalid')).required(t('mandatory')),
			first_name: Yup.string().required(t('mandatory')),
			last_name: Yup.string().required(t('mandatory')),
		});
	}, [t, user]);

	return { defaultValues, schema };
};

export const useUserSettingsForm = (methods: UseFormReturn<UserSettingsFormValues>) => {
	const t = useTranslations('settings.errors.user');

	const { user, isUserLoading, fetchUser } = useUser();

	const resetFormFromData = (input: ActiveUserFragment | UpdateUserInput) => {
		methods.reset({
			email: input.email,
			first_name: input.first_name,
			last_name: input.last_name,
			language: input.language,
			password: undefined,
			old_password: undefined,
			confirm_password: undefined,
		});
	};

	useEffect(() => {
		if (isUserLoading) return;

		if (user) {
			resetFormFromData(user!);
		}
	}, [isUserLoading]);

	const onSubmit: SubmitHandler<UserSettingsFormValues> = async (values) => {
		const { data } = await apiClient.mutate<
			UpdateUserMutation,
			UpdateUserMutationVariables
		>({
			mutation: UPDATE_USER,
			variables: {
				input: {
					email: values.email,
					first_name: values.first_name,
					last_name: values.last_name,
					old_password: values.old_password,
					password: values.password,
					language: values.language,
				},
			},
		});

		switch (data?.updateUser.__typename) {
			case 'ActiveUser':
				fetchUser(data.updateUser);
				resetFormFromData(data.updateUser);
				break;
			case 'UserAuthError':
				switch (data.updateUser.errorCode) {
					case UserAuthErrorCode.EmailAlreadyExists:
						methods.setError('email', {
							message: t('emailInUse'),
						});
						break;
					case UserAuthErrorCode.InvalidCredentials:
						methods.setError('old_password', {
							message: t('wrongPassword'),
							type: 'validate',
						});

						break;
				}
				break;
		}

		return true;
	};
	return { onSubmit, resetFormFromData };
};
