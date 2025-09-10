import { Progress } from '@/components/ui/progress';

interface Props {
	module: string;
	usage: number;
	usageOf: number;
}

export const Usage = ({ module, usage, usageOf }: Props) => {
	const percent = (usage / usageOf) * 100;

	return (
		<div className="flex flex-col gap-2">
			<div className="text-muted-foreground text-base">{module}</div>
			<div className="bg-foreground/5 flex flex-row items-center gap-6 rounded-lg p-4 ">
				<div className="text-sm font-semibold">
					{usage}/{usageOf}
				</div>
				<Progress value={percent} className="bg-foreground/10 h-[4px]" />
			</div>
		</div>
	);
};
