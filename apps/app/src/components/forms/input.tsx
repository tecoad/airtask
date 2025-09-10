'use client';

import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input, InputProps } from '@/components/ui/input';
import { useDisabled } from '@/core/contexts/disabled-provider';
import { cn } from '@/lib/utils';
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
	prefix?: string;
	isLoading?: boolean;
	type?: string;
	skeletonMode?: boolean;
	extra?: InputProps;
	asTextArea?: boolean;
	optional?: string;
};

export const InputField = <D extends FieldValues>({
	placeholder,
	label,
	className,
	control,
	name,
	optional,
	description,
	suffix,
	type,
	prefix,
	isLoading,
	skeletonMode,
	extra,
	asTextArea,
}: Props<D>) => {
	const TheInput = asTextArea ? (Textarea as any) : Input;
	const disabled = useDisabled();

	return (
		<FormField
			control={control}
			name={name as any}
			render={({ field }) => (
				<FormItem className={`${className} flex flex-col `}>
					{label && (
						<CustomFormLabel
							className={cn('leading-5', optional && 'flex items-center gap-2')}>
							{label}

							{optional && (
								<div className="text-muted-foreground text-sm">{optional}</div>
							)}
						</CustomFormLabel>
					)}
					<FormControl>
						<div className="relative flex flex-row items-center">
							{prefix && <span className="text-foreground/30 mr-3">{prefix}</span>}

							<TheInput
								placeholder={placeholder}
								disabled={disabled}
								{...extra}
								{...field}
								type={type}
								className={`${
									skeletonMode ? 'is-skeleton' : undefined
								} text-base md:text-sm`}
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
							{suffix && <span className="text-foreground/30 ml-3">{suffix}</span>}
						</div>
					</FormControl>
					{/* <FormMessage /> */}

					{description && (
						<div className="text-muted-foreground text-sm">{description}</div>
					)}

					{/* avoid hydratation error with div inside p */}
					{/* {description &&
						(skeletonMode ? (
							description
						) : (
							<FormDescription>{description}</FormDescription>
						))} */}
				</FormItem>
			)}
		/>
	);
};
