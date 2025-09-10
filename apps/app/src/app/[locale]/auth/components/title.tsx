interface Props {
	title?: string;
	subtitle?: string;
}

export const Title = ({ subtitle, title }: Props) => {
	return (
		<div className="flex flex-col space-y-2 text-center">
			{title && (
				<h1 className="text-foreground text-2xl font-semibold tracking-tight">{title}</h1>
			)}

			<p className="text-muted-foreground text-sm">{subtitle}</p>
		</div>
	);
};
