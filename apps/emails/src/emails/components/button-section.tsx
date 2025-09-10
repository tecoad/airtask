import { Button, Section } from '@react-email/components';
import React from 'react';

interface Props {
	href: string;
	label: string;
}

const ButtonSection = ({ href, label }: Props) => {
	return (
		<Section className="p-4 text-center">
			<Button
				className="bg-brand py-3 px-6 rounded-md text-white uppercase font-bold"
				href={href}>
				{label}
			</Button>
		</Section>
	);
};

export default ButtonSection;
