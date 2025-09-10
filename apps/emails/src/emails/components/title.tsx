import { Heading } from '@react-email/components';
import React from 'react';

interface Props {
	children: React.ReactNode;
	className?: string;
}

const Title = ({ children, className }: Props) => {
	return (
		<Heading
			className={`text-3xl text-center text-brand font-display ${
				className ? className : 'my-[30px]'
			}`}>
			{children}
		</Heading>
	);
};

export default Title;
