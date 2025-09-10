interface Props {
	children: React.ReactNode;
	className?: string;
}

export const FormActionsContainer = ({ children, className }: Props) => {
	return (
		<div
			className={`h-18 sticky bottom-0 flex flex-row items-center justify-end space-x-4 bg-gradient-to-t from-white from-30% to-white/0 pb-3 pt-6 dark:from-slate-900 dark:to-slate-900/0 ${className}`}>
			{/* <div className="flex-grow" /> */}
			{children}
		</div>
	);
};
