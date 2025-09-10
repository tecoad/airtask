'use client';

import { PhoneNumberFormat } from 'google-libphonenumber';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { InputField } from '../forms/input';
import { PopoverSelectField } from '../forms/popover-select';
import { COUNTRIES } from './countries';
import { formatNumber, usePhoneNumber } from './hooks';
import { UserIdentifierForm } from './user-identifier';

export const Phone = () => {
	const {
		watch,
		setValue,
		register,
		control,
		formState: { errors },
	} = useFormContext<UserIdentifierForm>();
	const [country, phone] = watch(['phoneCountryCode', 'phone']);
	const [isOpen, setIsOpen] = useState(false);
	const phoneCountryCodeField = useController({
			name: 'phoneCountryCode',
			control,
		}),
		phoneField = useController({
			name: 'phone',
			control,
		});
	const { exampleNumberByCountry, whatsappNumberFormatted } = usePhoneNumber({
		country,
		setCountry(v) {
			phoneCountryCodeField.field.onChange(v);
		},
		phone,
		setPhone(v) {
			phoneField.field.onChange(v);
		},
	});
	const t = useTranslations('user.form');

	return (
		<div className="wdg-flex wdg-gap-3">
			<PopoverSelectField
				control={control}
				name="phoneCountryCode"
				items={COUNTRIES.map((v) => ({
					value: v.value,
					label: v.title,
					customSelectedLabel: (
						<img
							alt={v.value}
							src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${v.value}.svg`}
							className={'wdg-inline wdg-h-4 wdg-rounded-sm'}
						/>
					),
				}))}
				maxItemsAtSearch={3}
				placeholder={t('country.label')}
				search={{
					noResults: t('country.searchNoResults'),
					placeholder: t('country.searchPlaceholder'),
				}}
			/>

			<InputField
				control={control}
				name="phone"
				type="tel"
				placeholder={exampleNumberByCountry || t('phone')}
				className="wdg-w-full"
				// errors.phone?.message
				extra={{
					value: whatsappNumberFormatted,
					onChange: ({ target }) => {
						const formatted = formatNumber(target.value, PhoneNumberFormat.E164, country);

						phoneField.field.onChange(formatted);
					},
				}}
			/>
		</div>
	);
};
