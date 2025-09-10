import { Separator } from '@/components/ui/separator';

interface Props {
	title?: string;
	subtitle?: string;
	separator?: 'top' | 'bottom' | 'both';
}

export const SectionTitle = ({ title, subtitle, separator }: Props) => {
	return (
		<div className="flex flex-col gap-4 ">
			{(separator === 'top' || separator === 'both') && <Separator />}
			<div>
				<h3 className="text-foreground text-lg font-semibold">{title}</h3>
				<p className="text-muted-foreground text-sm">{subtitle}</p>
			</div>
			{(separator === 'bottom' || separator === 'both') && <Separator />}
		</div>
	);
};
