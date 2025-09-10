'use client';

import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { InputProps } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { CustomError } from './custom-error-message';
import { CustomFormLabel } from './custom-form-label';
import { MultiSelect, OptionType } from './multiselect';

type Props<D extends FieldValues> = {
	placeholder?: string;
	label?: ReactNode;
	className?: string;
	control: Control<D, any>;
	name: Path<D>;
	description?: string | React.ReactNode;
	isLoading?: boolean;
	skeletonMode?: boolean;
	extra?: InputProps;
	options: OptionType[];
};

export const MultiSelectField = <D extends FieldValues>({
	placeholder,
	label,
	className,
	control,
	name,
	description,
	options,
	isLoading,
	skeletonMode,
}: Props<D>) => {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={`${className} flex flex-col `}>
					{label && <CustomFormLabel>{label}</CustomFormLabel>}

					<FormControl>
						<div className="relative flex flex-row items-center">
							<MultiSelect
								placeholder={placeholder}
								options={options}
								selected={options.filter((item) => field.value?.includes(item.value))}
								onChange={(v) => {
									field.onChange(v.map((v) => v.value));
								}}
							/>

							<CustomError />

							<div className="absolute right-3 h-4 w-4">
								{isLoading && (
									<Loader2
										size={24}
										strokeWidth={2.25}
										className="text-foreground h-4 w-4 animate-spin"
									/>
								)}
							</div>
						</div>
					</FormControl>

					{description && (
						<div className="text-muted-foreground text-sm">{description}</div>
					)}
				</FormItem>
			)}
		/>
	);
};
