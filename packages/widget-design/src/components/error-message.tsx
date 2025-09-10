interface Props {
	globalErrorMessage: string;
}

export const ErrorMessage = ({ globalErrorMessage }: Props) => {
	return (
		<div className="wdg-flex wdg-flex-1 wdg-flex-col wdg-items-center wdg-justify-center wdg-space-y-6  wdg-overflow-y-auto wdg-p-4 wdg-text-slate-600">
			{globalErrorMessage}
		</div>
	);
};
