import { objByString } from '@/core/helpers/obj-by-string';
import { FieldPath, FieldValues, useFormContext, UseFormReturn } from 'react-hook-form';

export const useWithError = <D extends FieldValues>(methods?: UseFormReturn<D>) => {
	const ctx = useFormContext<D>();
	const {
		formState: { errors, touchedFields },
	} = methods || ctx;

	return (field: FieldPath<D>) => {
		return !!objByString(touchedFields, field) && !!objByString(errors, field)?.message;
	};
};

export const useIsValidated = <D extends FieldValues>(methods?: UseFormReturn<D>) => {
	const ctx = useFormContext<D>();
	const {
		formState: { errors, touchedFields },
	} = methods || ctx;

	return (field: FieldPath<D>) =>
		Boolean(
			(objByString(errors, field)?.message?.length ?? 0) === 0 &&
				objByString(touchedFields, field),
		);
};
