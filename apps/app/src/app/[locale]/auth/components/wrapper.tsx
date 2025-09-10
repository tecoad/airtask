import { ReactNode } from 'react';

export const Wrapper = ({ children }: { children: ReactNode }) => {
	return (
		<div className="mx-auto flex  flex-col justify-center space-y-6  md:max-w-[350px]">
			{children}
		</div>
	);
};
