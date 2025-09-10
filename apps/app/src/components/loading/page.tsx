import { LoadingAnimation } from './animation';

export function LoadingPage() {
	return (
		<div className="absolute inset-0 flex items-center justify-center">
			<LoadingAnimation width="55px" color="#14e5c5" />
			{/* <Loader2 className="h-10 w-10 animate-[spin_0.5s_linear_infinite] text-sky-500" /> */}
		</div>
	);
}
