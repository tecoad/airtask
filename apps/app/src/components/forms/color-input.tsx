'use client';

import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Control, FieldValues, Path } from 'react-hook-form';
import { GradientPicker, PickerMode } from '../gradient-picker';

type Props<D extends FieldValues> = {
	placeholder?: string;
	label: string;
	className?: string;
	control?: Control<D, any>;
	name: Path<D>;
	description?: string | React.ReactNode;
	modes: PickerMode[];
	skeletonMode?: boolean;
};

export const ColorInputField = <D extends FieldValues>({
	placeholder,
	label,
	className,
	control,
	name,
	description,
	skeletonMode,
	modes,
}: Props<D>) => {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={`${className} flex flex-col `}>
					<FormLabel>{label}</FormLabel>
					<FormControl className={skeletonMode ? 'is-skeleton' : undefined}>
						<GradientPicker
							className="w-full truncate"
							modes={modes}
							background={placeholder || field.value}
							setBackground={(value) => {
								field.onChange(value);
							}}
						/>
					</FormControl>

					{description && (
						<FormDescription className={skeletonMode ? 'is-skeleton' : undefined}>
							{description}
						</FormDescription>
					)}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
