type GroupColors = {
	outerBorder: string;
	hoverColor: string;
	backgroundColor: string;
	innerBackgroundColor: string;
	innerContentColor: string;
};

type GroupProps = {
	colors: GroupColors;
};

export const ThemeOption = ({ colors }: GroupProps) => {
	return (
		<div
			className={`cursor-pointer items-center rounded-md border-2 border-${colors.outerBorder} p-1 hover:border-${colors.hoverColor}`}>
			<div className={`space-y-2 rounded-sm bg-${colors.backgroundColor} p-2`}>
				<div
					className={`space-y-2 rounded-md bg-${colors.innerBackgroundColor} p-2 shadow-sm`}>
					<div className={`h-2 w-[80px] rounded-lg bg-${colors.innerContentColor}`} />
					<div className={`h-2 w-[100px] rounded-lg bg-${colors.innerContentColor}`} />
				</div>
				<div
					className={`flex items-center space-x-2 rounded-md bg-${colors.innerBackgroundColor} p-2 shadow-sm`}>
					<div className={`h-4 w-4 rounded-full bg-${colors.innerContentColor}`} />
					<div className={`h-2 w-[100px] rounded-lg bg-${colors.innerContentColor}`} />
				</div>
				<div
					className={`flex items-center space-x-2 rounded-md bg-${colors.innerBackgroundColor} p-2 shadow-sm`}>
					<div className={`h-4 w-4 rounded-full bg-${colors.innerContentColor}`} />
					<div className={`h-2 w-[100px] rounded-lg bg-${colors.innerContentColor}`} />
				</div>
			</div>
		</div>
	);
};
