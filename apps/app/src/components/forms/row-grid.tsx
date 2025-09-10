import React from 'react';

interface Props {
	children: React.ReactNode;
	className?: string;
}

export const RowGrid = ({ children, className }: Props) => {
	return (
		<div className={`grid grid-cols-2 items-end gap-x-2 md:gap-x-4 ${className}`}>
			{children}
		</div>
	);
};
