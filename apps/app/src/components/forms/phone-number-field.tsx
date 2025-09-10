import { useController } from 'react-hook-form';

import { usePhoneNumber } from '@/core';
import { Control, FieldValues, Path } from 'react-hook-form';
import { InputField } from './input';

type Props<D extends FieldValues> = {
	label: string;
	control: Control<D, any>;
	name: Path<D>;
};

export const PhoneNumberField = <D extends FieldValues>({
	name,
	label,
	control,
}: Props<D>) => {
	const phoneField = useController({
		name,
		control,
	});
	usePhoneNumber({
		phone: phoneField.field.value,
		setPhone(v) {
			phoneField.field.onChange(v);
		},
	});

	return (
		<div className="wdg-flex wdg-gap-3">
			<InputField<D>
				control={control}
				name={phoneField.field.name}
				label={label}
				type="tel"
				className="wdg-w-full"
			/>
		</div>
	);
};
