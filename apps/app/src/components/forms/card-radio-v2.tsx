import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle2 } from 'lucide-react';
import { Control, FieldValues, Path } from 'react-hook-form';
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../ui/form';

type Props<D extends FieldValues> = {
	control?: Control<D>;
	name: Path<D>;
	items: { label: string; value: string; description?: string }[];
	title?: string;
	description?: string;
	className?: string;
	value?: string;
	onChange?: (value: string) => void;
};

export const CardRadioField = <D extends FieldValues>({
	items,
	control,
	description,
	title,
	name,
	className,
	onChange,
	value,
}: Props<D>) => {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={`${className} flex flex-col gap-3`}>
					<div>
						{title && (
							<FormLabel className="text-foreground text-lg font-semibold">
								{title}
							</FormLabel>
						)}
						{description && (
							<FormDescription className="text-foreground/80">
								{description}
							</FormDescription>
						)}
					</div>

					<FormControl>
						<RadioGroup
							onValueChange={onChange || field.onChange}
							defaultValue={value || field.value}
							value={value}
							className="flex flex-wrap gap-4">
							{items.map((v, k) => (
								<FormItem key={k} className="flex-grow basis-[200px]">
									<FormLabel className="[&:has([data-state=checked])]:border-foreground/90 border-foreground/10 block cursor-pointer rounded-lg border-2 p-4 transition-colors [&:has([data-state=checked])>div>svg]:opacity-100 ">
										<FormControl>
											<RadioGroupItem value={v.value} className="sr-only" />
										</FormControl>

										<div className="flex items-center justify-between">
											<p className="text-foreground font-semibold">{v.label}</p>
											<CheckCircle2
												size={24}
												strokeWidth={1.9}
												className=" text-foreground opacity-0 transition-opacity"
											/>
										</div>

										{v.description && (
											<p className="text-foreground/60 mt-1 leading-tight">
												{v.description}
											</p>
										)}
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
