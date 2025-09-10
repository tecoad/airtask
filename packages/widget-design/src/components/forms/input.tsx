'use client';

import { FormControl, FormDescription, FormField, FormItem } from '@/components/ui/form';
import { Input, InputProps } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';
import { Control, FieldValues } from 'react-hook-form';
import { Textarea } from '../ui/textarea';
import { CustomError } from './custom-error-message';
import { CustomFormLabel } from './custom-form-label';

type Props<D extends FieldValues> = {
	placeholder?: string;
	label?: ReactNode;
	className?: string;
	control: Control<D, any>;
	name: keyof D;
	description?: string | React.ReactNode;
	suffix?: string;
	isLoading?: boolean;
	type?: string;
	skeletonMode?: boolean;
	extra?: InputProps;
	asTextArea?: boolean;
};

export const InputField = <D extends FieldValues>({
	placeholder,
	label,
	className,
	control,
	name,
	description,
	suffix,
	type,
	isLoading,
	skeletonMode,
	extra,
	asTextArea,
}: Props<D>) => {
	const TheInput = asTextArea ? (Textarea as any) : Input;

	return (
		<FormField
			control={control}
			name={name as any}
			render={({ field }) => (
				<FormItem className={`${className} wdg-flex wdg-flex-col `}>
					{label && <CustomFormLabel>{label}</CustomFormLabel>}

					<FormControl>
						<div className="wdg-relative wdg-flex wdg-flex-row wdg-items-center">
							<TheInput
								placeholder={placeholder}
								{...field}
								{...extra}
								type={type}
								className={`${
									skeletonMode ? 'wdg-is-skeleton' : undefined
								} wdg-input wdg-text-base wdg-md:text-sm`}
							/>

							<CustomError />

							<div className="wdg-absolute wdg-right-3 wdg-h-4 wdg-w-4">
								{isLoading && (
									<Loader2
										size={24}
										strokeWidth={2.25}
										className="wdg-text-foreground wdg-h-4 wdg-w-4 wdg-animate-spin"
									/>
								)}
							</div>
							{suffix && (
								<span className="wdg-text-foreground/30 wdg-ml-3">{suffix}</span>
							)}
						</div>
					</FormControl>
					{/* <FormMessage /> */}

					{/* avoid hydratation error with div inside p */}
					{description &&
						(skeletonMode ? (
							description
						) : (
							<FormDescription>{description}</FormDescription>
						))}
				</FormItem>
			)}
		/>
	);
};
