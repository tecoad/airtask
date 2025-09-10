import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ReactNode } from 'react';
import { Control, FieldValues } from 'react-hook-form';
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../ui/form';

type Props = {
	control?: Control<FieldValues>;
	items: { label: string; node: ReactNode; value: string }[];
	title?: string;
	description?: string;
	className?: string;
};

export const CardRadioField = ({
	items,
	control,
	description,
	title,
	className,
}: Props) => {
	return (
		<FormField
			control={control}
			name="type"
			render={({ field }) => (
				<FormItem className={`${className} flex flex-col`}>
					<div>
						{title && <FormLabel className="text-base">{title}</FormLabel>}
						{description && <FormDescription>{description}</FormDescription>}
					</div>

					<FormControl>
						<RadioGroup
							onValueChange={field.onChange}
							defaultValue={field.value}
							className="grid max-w-md grid-cols-2 gap-8 pt-2">
							{items.map((v, k) => (
								<FormItem key={k}>
									<FormLabel className="[&:has([data-state=checked])>div]:border-primary">
										<FormControl>
											<RadioGroupItem value={v.value} className="sr-only" />
										</FormControl>
										{v.node}
										<span className="block w-full p-2 text-center font-normal">
											{v.label}
										</span>
									</FormLabel>
								</FormItem>
							))}
						</RadioGroup>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
