'use client';

import { replaceColor } from 'lottie-colorify';
import Lottie from 'lottie-react';
import { useMemo } from 'react';
import LogoAnimation from './logo-animation-rounded-bg.json';

type Props = {
	color?: string;
	width: string;
};

export const LoadingAnimation = ({ width, color }: Props) => {
	const animationData = useMemo(() => {
		let data = LogoAnimation;

		try {
			if (color) {
				const sanitizedColor = color.replace('#', '');
				data = replaceColor('#ffffff', sanitizedColor, data);
			}
		} catch {
			/** */
		}

		return data;
	}, [color]);

	//@ts-ignore
	return <Lottie style={{ width }} animationData={animationData} loop={true} />;
};
