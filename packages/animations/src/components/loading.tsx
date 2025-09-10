import { replaceColor } from 'lottie-colorify';
import Lottie from 'lottie-react';
import { useMemo } from 'react';
import airtaskSymbol from '../animations/airtask-symbol-animation.json';

import tinycolor from 'tinycolor2';

type Props = {
	color?: string;
	width: string;
};

export const LoadingAnimation = ({ width, color }: Props) => {
	const hexColor = tinycolor(color).toHexString();

	const animationData = useMemo(() => {
		let data = airtaskSymbol;

		try {
			if (color) {
				data = replaceColor('#0470FF', hexColor, data);
			}
		} catch {
			/** */
		}

		return data;
	}, [color]);
	//@ts-ignore
	return <Lottie style={{ width }} animationData={animationData} loop={true} />;
};
