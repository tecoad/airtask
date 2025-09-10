import { yupResolver } from '@hookform/resolvers/yup';
import { PhoneNumberFormat } from 'google-libphonenumber';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { isPhoneValid } from '../../lib/phone-number';
import { InputField } from '../forms/input';
import { formatNumber } from './hooks';
import { Phone } from './phone';

export type UserIdentifierForm = {
	name: string;
	email: string;
	phoneCountryCode: string;
	phone: string;
};

export const UserIdentifier = ({
	onSubmit,
}: {
	onSubmit: (values: UserIdentifierForm) => void | Promise<void>;
}) => {
	const methods = useForm<UserIdentifierForm>({
		resolver: yupResolver(
			Yup.object({
				name: Yup.string().required('Insira seu nome'),
				email: Yup.string().email('Email inválido').required('Insira um email'),
				phone: Yup.string().test('is-valid', 'Número inválido', function (this, e) {
					return isPhoneValid(e, this.parent.phoneCountryCode);
				}),
			}) as any,
		),
		defaultValues: {
			phoneCountryCode: 'BR',
		},
		mode: 'onSubmit',
	});
	const {
		control,
		register,
		formState: { errors, isSubmitting },
		handleSubmit,
	} = methods;
	const t = useTranslations('user.form');

	return (
		<FormProvider {...methods}>
			<form
				style={{ display: 'contents' }}
				onSubmit={(e) => {
					e.stopPropagation();
					e.preventDefault();

					handleSubmit(async (data) => {
						await onSubmit({
							...data,
							// Format to I164 format to submit
							phone: formatNumber(
								data.phone,
								PhoneNumberFormat.E164,
								data.phoneCountryCode,
							),
						});
					})(e);
				}}>
				<div className="wdg-space-y-3 wdg-p-3 md:wdg-px-6">
					<div className="wdg-flex wdg-w-full wdg-gap-3">
						<InputField
							type="text"
							control={control}
							name="name"
							placeholder={t('name')}
							className="wdg-w-1/2"
						/>
						<InputField
							type="text"
							control={control}
							name="email"
							placeholder={t('email')}
							className="wdg-w-1/2"
						/>
					</div>

					<div className="wdg-flex wdg-gap-3">
						<div className="wdg-flex-shrink wdg-flex-grow">
							<Phone />
						</div>
						<div className="wdg-w-auto">
							<button
								type="submit"
								className="wdg-px-4 wdg-h-full wdg-button hover:wdg-color-gradient hover:wdg-background-animate2">
								{t('start')}
								{isSubmitting ? (
									<Loader2
										size={18}
										strokeWidth={2}
										className="wdg-opacity-70 wdg-animate-spin"
									/>
								) : (
									<ArrowRight size={20} strokeWidth={2} className="wdg-opacity-70" />
								)}
							</button>
						</div>
					</div>
				</div>
			</form>
		</FormProvider>
	);
};
