interface Props {
	number: number;
	skeletonMode?: boolean;
}

export const Number = ({ number, skeletonMode }: Props) => {
	return (
		<div
			className={`text-bold from-foreground/10 to-foreground/50 text-foreground highlight-white/10 flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br text-lg leading-none ${
				skeletonMode ? 'animate-pulse text-transparent' : ''
			}`}>
			{number}
		</div>
	);
};
