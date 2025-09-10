import { Control, FieldValues } from 'react-hook-form';
import { Checkbox } from '../ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

type Props = {
	control?: Control<FieldValues>;
	items: { label: string; value: string; description?: string }[];
	title?: string;
};

export const CheckField = ({ items, control, title }: Props) => {
	return (
		<FormField
			control={control}
			name="type"
			render={({ field }) => (
				<FormItem className="space-y-3">
					{title && <FormLabel>{title}</FormLabel>}
					<FormControl>
						<>
							{items.map((v, k) => (
								<FormItem className="flex items-center space-x-3 space-y-0" key={k}>
									<FormControl>
										<Checkbox value={v.value} />
									</FormControl>
									<FormLabel className="font-normal">{v.label}</FormLabel>
								</FormItem>
							))}
						</>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
