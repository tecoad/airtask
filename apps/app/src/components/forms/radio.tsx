import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

type Props = {
	control?: Control<FieldValues>;
	items: { label: string; value: string }[];
	title?: string;
};

export const RadioField = ({ items, control, title }: Props) => {
	return (
		<FormField
			control={control}
			name="type"
			render={({ field }) => (
				<FormItem className="space-y-3">
					{title && <FormLabel>{title}</FormLabel>}
					<FormControl>
						<RadioGroup
							onValueChange={field.onChange}
							defaultValue={field.value}
							className="flex flex-col space-y-1">
							{items.map((v, k) => (
								<FormItem className="flex items-center space-x-3 space-y-0" key={k}>
									<FormControl>
										<RadioGroupItem value={v.value} />
									</FormControl>
									<FormLabel className="font-normal">{v.label}</FormLabel>
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
