'use client';

import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useDisabled } from '@/core/contexts/disabled-provider';
import { SwitchProps } from '@radix-ui/react-switch';
import { Control, FieldValues, Path } from 'react-hook-form';
import { Skeleton } from '../ui/skeleton';

type Props<D extends FieldValues> = {
	control?: Control<D, any>;
	name: Path<D>;
	title: string;
	description?: string;
	skeletonMode?: boolean;
	skipDisabledProvider?: boolean;
	disabled?: boolean;
	onChange?(v: boolean): void;
	className?: string;

	overrideSwitchProps?: SwitchProps;
};

export const CardToggleField = <D extends FieldValues>({
	control,
	name,
	title,
	description,
	skeletonMode,
	skipDisabledProvider,
	disabled,
	onChange,
	className,
	overrideSwitchProps,
}: Props<D>) => {
	const globalDisabled = useDisabled();
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem
					className={`flex flex-row items-center justify-between gap-3 rounded-lg border px-4 py-0 ${className}`}>
					<div className="space-y-0.5 py-2 md:py-4">
						<FormLabel className="text-foreground/90 block text-base leading-5">
							{title}
						</FormLabel>
						<FormDescription>{description}</FormDescription>
					</div>
					<FormControl className="!m-0 ">
						{skeletonMode ? (
							<Skeleton className="h-6 w-6 rounded-full" />
						) : (
							<Switch
								checked={field.value}
								className="m-0 p-0"
								onCheckedChange={(v) => {
									field.onChange(v);
									onChange?.(v);
								}}
								disabled={disabled || (!skipDisabledProvider && globalDisabled)}
								{...overrideSwitchProps}
							/>
						)}
					</FormControl>
				</FormItem>
			)}
		/>
	);
};
