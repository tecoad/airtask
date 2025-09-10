'use client';

import { useUser } from '@/lib/user';
import { setUserCookies } from '@/lib/user/helpers';
// import { CONSTANTS } from "@airtask/core";
// import { useBanner } from "@core";
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/core/services/graphql';
import {
	LoginUserMutation,
	LoginUserMutationVariables,
	RegisterUserMutation,
	RegisterUserMutationVariables,
	RequestUserEmailVerificationMutation,
	RequestUserEmailVerificationMutationVariables,
	RequestUserPasswordResetMutation,
	RequestUserPasswordResetMutationVariables,
	ResetUserPasswordMutation,
	ResetUserPasswordMutationVariables,
	UserAuthErrorCode,
	VerifyUserEmailErrorCode,
	VerifyUserEmailMutation,
	VerifyUserEmailMutationVariables,
} from '@/core/shared/gql-api-schema';
import { usePathname, useSearchParams } from 'next/navigation';

import { i18nLanguageCodeToGql } from '@/core/helpers/gql-language-code-to-i18n';
import { CONSTANTS } from '@airtask/core/src/config';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import { useEffect, useMemo, useState } from 'react';
import TagManager from 'react-gtm-module-custom-domain';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import * as Yup from 'yup';
import {
	LOGIN_USER,
	REGISTER_USER,
	REQUEST_USER_EMAIL_VERIFICATION,
	REQUEST_USER_PASSWORD_RESET,
	RESET_USER_PASSWORD,
	VERIFY_USER_EMAIL,
} from './api-gql';
import { redirectSearchParam } from './helpers';

/**
 * The LOGIN form
 */
export type LoginFormValues = {
	email: string;
	password: string;
};

export const useSetupLoginForm = () => {
	const t = useTranslations('auth');
	const schema = useMemo(() => {
		return Yup.object({
			email: Yup.string().email(t('errors.emailInvalid')).required(t('errors.mandatory')),
			password: Yup.string().required(t('errors.mandatory')),
		});
	}, [t]);
	const defaultValues = useMemo<LoginFormValues>(
		() => ({
			email: '',
			password: '',
		}),
		[],
	);

	return { defaultValues, schema };
};

export const useLoginForm = (methods: UseFormReturn<LoginFormValues>) => {
	const { fetchUser } = useUser();
	const searchParams = useSearchParams(),
		router = useRouter(),
		pathname = usePathname();

	const t = useTranslations('auth');

	const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
		try {
			const { data } = await apiClient.mutate<
				LoginUserMutation,
				LoginUserMutationVariables
			>({
				mutation: LOGIN_USER,
				variables: {
					input: {
						email: values.email,
						password: values.password,
					},
				},
			});

			switch (data?.loginUser.__typename) {
				case 'ActiveUser': {
					setUserCookies(data.loginUser, false);

					TagManager.dataLayer({
						dataLayer: {
							event: 'login',
							_clear: true,
						},
					});

					// update anonymous_id cookie only after event is sent
					setUserCookies(data.loginUser);

					await fetchUser(data.loginUser);
					// Login successfully, redirect to dashboard
					router.push(searchParams.get(redirectSearchParam) ?? '/dashboard');

					break;
				}
				case 'UserAuthError': {
					switch (data.loginUser.errorCode) {
						case UserAuthErrorCode.InvalidCredentials: {
							// Invalid credentials warning
							methods.setError('password', {
								message: t('errors.invalidCredentials'),
							});

							break;
						}
						case UserAuthErrorCode.EmailNotVerified: {
							router.push(`${pathname}?verifyEmail=true`);

							break;
						}
					}

					break;
				}
			}
		} catch (e) {
			console.log(e);
		}
	};

	return { onSubmit };
};

/**
 * The REGISTER form
 */
export type RegisterFormValues = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
};

export const useSetupRegisterForm = () => {
	const t = useTranslations('auth');

	const schema = useMemo(() => {
		return Yup.object({
			firstName: Yup.string().required(t('errors.mandatory')),
			lastName: Yup.string().required(t('errors.mandatory')),
			email: Yup.string().email(t('errors.emailInvalid')).required(t('errors.mandatory')),
			password: Yup.string().required(t('errors.mandatory')),
		});
	}, [t]);
	const defaultValues = useMemo<RegisterFormValues>(
		() => ({
			firstName: '',
			lastName: '',
			email: '',
			password: '',
		}),
		[],
	);

	return { defaultValues, schema };
};

export const useRegisterForm = (methods: UseFormReturn<RegisterFormValues>) => {
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations('auth');
	const locale = useLocale();

	const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
		const cookies = parseCookies();
		try {
			setUserCookies({
				email: values.email,
				first_name: values.firstName,
				last_name: values.lastName,
			});
			const input = {
				first_name: values.firstName,
				last_name: values.lastName,
				email: values.email,
				password: values.password,
				referrer: cookies[CONSTANTS.COOKIES.referrer],
				language: i18nLanguageCodeToGql[locale as 'en'],
			};
			const { data } = await apiClient.mutate<
				RegisterUserMutation,
				RegisterUserMutationVariables
			>({
				mutation: REGISTER_USER,
				variables: {
					input,
				},
			});

			switch (data?.registerUser.__typename) {
				case 'UserRegistered': {
					setUserCookies({
						id: data.registerUser.created_id,
						email: values.email,
						first_name: values.firstName,
						last_name: values.lastName,
					});
					TagManager.dataLayer({
						dataLayer: {
							event: 'sign_up',
							_clear: true,
							user_data: {
								email_address: values.email,
								address: {
									firstname: values.firstName,
									lastname: values.lastName,
								},
							},
							//user_id: retonar aqui o id do usuario cadastrado
						},
					});

					router.push(`${pathname}?registered=true`);

					break;
				}
				case 'UserAuthError': {
					switch (data.registerUser.errorCode) {
						case UserAuthErrorCode.EmailAlreadyExists: {
							// Invalid credentials warning
							methods.setError('email', {
								message: t('errors.emailInUse'),
							});

							break;
						}
					}

					break;
				}
			}
		} catch (e) {
			console.log(e);
		}
	};

	return { onSubmit };
};

export const useVerifyEmail = () => {
	const router = useRouter();
	const { fetchUser } = useUser();
	const { toast } = useToast();
	const params = useSearchParams();
	const id = params.get('id'),
		token = params.get('token');
	const [state, setState] = useState<'loading' | 'invalid-code' | 'expired-code'>(
		'loading',
	);
	const [resendLoading, setResendLoading] = useState(false);

	const t = useTranslations('auth.verifyEmail');

	const load = async () => {
		setState('loading');
		try {
			const { data } = await apiClient.mutate<
				VerifyUserEmailMutation,
				VerifyUserEmailMutationVariables
			>({
				mutation: VERIFY_USER_EMAIL,
				variables: {
					token: token!,
					verifyUserEmailId: id!,
				},
			});

			switch (data?.verifyUserEmail.__typename) {
				case 'ActiveUser': {
					await fetchUser(data.verifyUserEmail);
					router.push('/plans');

					break;
				}
				case 'VerifyUserEmailError': {
					switch (data.verifyUserEmail.errorCode) {
						case VerifyUserEmailErrorCode.ExpiredToken: {
							setState('expired-code');
							break;
						}
						case VerifyUserEmailErrorCode.InvalidToken: {
							setState('invalid-code');

							break;
						}
					}

					break;
				}
			}
		} catch (e) {
			console.log(e);
		}
	};

	const resendCode = async () => {
		setResendLoading(true);
		try {
			await apiClient.mutate<
				RequestUserEmailVerificationMutation,
				RequestUserEmailVerificationMutationVariables
			>({
				mutation: REQUEST_USER_EMAIL_VERIFICATION,
				variables: {
					requestUserEmailVerificationId: id!,
				},
			});

			toast({
				title: t('success'),
				description: t('codeSent'),
			});
		} catch (e) {
			console.log(e);
		} finally {
			setResendLoading(false);
		}
	};

	useEffect(() => {
		if (id && token) {
			load();
		}
	}, [token, id]);

	return { state, resendCode, resendLoading };
};

/**
 * The reset password request
 */
export const useRequestPasswordRequest = (methods: UseFormReturn<LoginFormValues>) => {
	const [isLoading, setLoading] = useState(false);
	const { toast } = useToast();

	const t = useTranslations('auth.passwordReset');

	const requestPasswordReset = async () => {
		setLoading(true);
		try {
			const isValid = await methods.trigger('email');

			if (!isValid) {
				setLoading(false);
				return;
			}

			const email = methods.getValues('email');
			await apiClient.mutate<
				RequestUserPasswordResetMutation,
				RequestUserPasswordResetMutationVariables
			>({
				mutation: REQUEST_USER_PASSWORD_RESET,
				variables: {
					email,
				},
			});

			toast({
				title: t('success'),
				description: t('instructionsSent'),
			});
		} catch (e) {
			console.log(e);
		} finally {
			setLoading(false);
		}
	};

	return { isRequestResetPasswordLoading: isLoading, requestPasswordReset };
};

/**
 * The request reset password form
 */
export type RequestResetPasswordFormValues = {
	email: string;
};

export const useSetupRequestResetPasswordForm = () => {
	const t = useTranslations('auth');
	const schema = useMemo(() => {
		return Yup.object({
			email: Yup.string().email(t('errors.emailInvalid')).required(t('errors.mandatory')),
		});
	}, []);
	const defaultValues = useMemo<RequestResetPasswordFormValues>(
		() => ({
			email: '',
		}),
		[],
	);

	return { defaultValues, schema };
};

export const useRequestResetPasswordForm = () => {
	const [success, setSuccess] = useState(false);

	const onSubmit: SubmitHandler<RequestResetPasswordFormValues> = async (values) => {
		try {
			const { data } = await apiClient.mutate<
				RequestUserPasswordResetMutation,
				RequestUserPasswordResetMutationVariables
			>({
				mutation: REQUEST_USER_PASSWORD_RESET,
				variables: {
					email: values.email,
				},
			});

			if (data?.requestUserPasswordReset) {
				setSuccess(data.requestUserPasswordReset);
			}
		} catch (e) {
			console.log(e);
		}
	};

	return { onSubmit, success };
};

/**
 * The reset password form
 */
export type ResetPasswordFormValues = {
	newPassword: string;
	confirmPassword: string;
};

export const useSetupResetPasswordForm = () => {
	const t = useTranslations('auth');
	const schema = useMemo(() => {
		return Yup.object({
			newPassword: Yup.string().required(t('errors.mandatory')),
			confirmPassword: Yup.string()
				.required(t('errors.mandatory'))
				.test('passwords-match', t('errors.passwordsDontMatch'), function (this, value) {
					return this.parent.newPassword === value;
				}),
		});
	}, []);
	const defaultValues = useMemo<ResetPasswordFormValues>(
		() => ({
			newPassword: '',
			confirmPassword: '',
		}),
		[],
	);

	return { defaultValues, schema };
};

export const useResetPasswordForm = () => {
	const router = useRouter();
	const token = useSearchParams().get('token');
	const { fetchUser } = useUser();
	const { toast } = useToast();
	const t = useTranslations('auth.passwordReset');

	const onSubmit: SubmitHandler<ResetPasswordFormValues> = async (values) => {
		try {
			const { data } = await apiClient.mutate<
				ResetUserPasswordMutation,
				ResetUserPasswordMutationVariables
			>({
				mutation: RESET_USER_PASSWORD,
				variables: {
					input: {
						password: values.newPassword,
						token: token!,
					},
				},
			});

			switch (data?.resetUserPassword.__typename) {
				case 'ActiveUser': {
					await fetchUser(data.resetUserPassword);

					router.push('/dashboard');

					break;
				}
				case 'VerifyUserEmailError': {
					switch (data.resetUserPassword.errorCode) {
						case VerifyUserEmailErrorCode.ExpiredToken:
						case VerifyUserEmailErrorCode.InvalidToken: {
							const { dismiss } = toast({
								description: t('linkInvalid'),
								variant: 'destructive',
								action: (
									<ToastAction
										altText={t('requestLink')}
										onClick={() => {
											router.push('/auth/password-reset');
											dismiss();
										}}>
										{t('requestLink')}
									</ToastAction>
								),
							});

							break;
						}
					}

					break;
				}
			}
		} catch (e) {
			console.log(e);
		}
	};

	return { onSubmit, token };
};
