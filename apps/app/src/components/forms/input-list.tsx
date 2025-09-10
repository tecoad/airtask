'use client';

import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { useDisabled } from '@/core/contexts/disabled-provider';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
	ArrayPath,
	Control,
	FieldArray,
	FieldValues,
	Path,
	useFieldArray,
} from 'react-hook-form';
import { CustomButton } from '../custom-button';
import { Input } from '../ui/input';

type Props<D extends FieldValues, T extends FieldValues> = {
	placeholder?: string;
	label: string;
	className?: string;
	control?: Control<D, any>;
	name: Path<D>;
	description?: string;
	values: { value: FieldArray<T>; getFieldPath: (index: number) => Path<D> }[];
	newValue: FieldArray<D, ArrayPath<D>> | FieldArray<D, ArrayPath<D>>[];
	skeletonMode?: boolean;
	addNewLabel: string;
};

export const InputListField = <D extends FieldValues, T extends FieldValues>({
	placeholder,
	label,
	className,
	control,
	name,
	values,
	newValue,
	description,
	skeletonMode,
	addNewLabel,
}: Props<D, T>) => {
	const t = useTranslations('ui');
	const { append } = useFieldArray({
		control: control,
		name: name as any,
	});
	const disabled = useDisabled();

	return (
		<div>
			{values.map((value, index) => (
				<FormField
					control={control}
					key={index}
					name={value.getFieldPath(index)}
					render={({ field }) => (
						<FormItem className={`${className} flex flex-col `}>
							<FormLabel className={cn(index !== 0 && 'sr-only')}>{label}</FormLabel>
							{description && (
								<FormDescription className={cn(index !== 0 && 'sr-only')}>
									{description}
								</FormDescription>
							)}

							<FormControl>
								<Input
									disabled={disabled}
									placeholder={placeholder}
									{...field}
									className={skeletonMode ? 'is-skeleton' : undefined}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			))}
			<CustomButton
				type="button"
				variant="outline"
				size="sm"
				className="mt-2"
				onClick={() => append(newValue)}>
				{addNewLabel}
			</CustomButton>
		</div>
	);
};
