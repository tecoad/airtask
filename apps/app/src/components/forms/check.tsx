'use client';

import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/ui/form';
import { ReactNode } from 'react';
import { Control } from 'react-hook-form';
import { Checkbox } from '../ui/checkbox';

type Props = {
	control?: Control<any, any>;

	title: string;
	description?: ReactNode;
};

export const CheckField = ({ title, control, description }: Props) => {
	return (
		<FormField
			control={control}
			name="mobile"
			render={({ field }) => (
				<FormItem className="flex flex-row items-start space-x-3 space-y-0">
					<FormControl>
						<Checkbox checked={field.value} onCheckedChange={field.onChange} />
					</FormControl>
					<div className="space-y-1 leading-none">
						<FormLabel>{title}</FormLabel>
						{description && <FormDescription>{description}</FormDescription>}
					</div>
				</FormItem>
			)}
		/>
	);
};
