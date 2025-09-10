import stc from 'string-to-color';
import tinycolor from 'tinycolor2';

export function generateThumb(str: string) {
	let color;
	if (str === 'enabled') {
		color = 'green';
	} else if (str === 'disabled') {
		color = 'red';
	} else {
		color = stc(str);
	}

	return getSpinColors(color, [0, 120], 'hex');
}

export function getSpinColors(
	inputColor: string,
	colorOffsets: number[],
	format?: 'hsl' | 'hex',
): string[] {
	const baseColor = tinycolor(inputColor);
	const formattedColors = colorOffsets.map((offset) => {
		const color = baseColor.spin(offset);
		if (format === 'hsl') {
			return color.toHslString();
			// return `${color.toHsl().h} ${color.toHsl().s} ${color.toHsl().l}`;
		} else {
			return color.toHexString();
		}
	});

	return formattedColors;
}
