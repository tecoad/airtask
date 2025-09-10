import { Separator } from './ui/separator';

interface Props {
	title: string;
	subtitle?: string;
	separator?: boolean;
	skeletonMode?: boolean;
	horizontal?: boolean;
}

export const Title = ({
	title,
	subtitle,
	separator,
	skeletonMode,
	horizontal,
}: Props) => {
	return (
		<>
			<div
				className={`flex  items-start  ${
					horizontal ? 'flex-row items-center gap-4' : 'flex-col gap-2'
				}`}>
				<h2
					className={` text-foreground text-2xl font-bold tracking-tight ${
						skeletonMode && 'is-skeleton'
					}`}>
					{title}
				</h2>
				{subtitle && (
					<p className={`text-muted-foreground ${skeletonMode && 'is-skeleton'}`}>
						{subtitle}
					</p>
				)}
			</div>
			{separator && <Separator className="my-6" />}
		</>
	);
};
