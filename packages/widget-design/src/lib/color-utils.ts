import tinycolor from 'tinycolor2';

export function getHslString(inputColor: string): string {
	return tinycolor(inputColor).toHslString();
}

export function getSpinColors(
	inputColor: string,
	colorOffsets: number[],
	format?: boolean,
): string[] {
	const baseColor = tinycolor(inputColor);
	const formattedColors = colorOffsets.map((offset) => {
		const color = baseColor.spin(offset);
		if (format) {
			return `${color.toHsl().h} ${color.toHsl().s} ${color.toHsl().l}`;
		} else {
			return color.toHslString();
		}
	});

	return formattedColors;
}

export function getSaturated(inputColor: string, amount: number = 1): string {
	let hsv = tinycolor(inputColor).toHsv();

	hsv.s += amount;
	if (hsv.s > 1) {
		hsv.s = 1;
	}
	return tinycolor(hsv).toHslString();
}

export function getLightOrDark(color: tinycolor.Instance): string {
	const lightOrDark = color.isLight() ? 'light' : 'dark';
	return `${lightOrDark}`;
}

// Função que retorna a cor com melhor contraste em relação a inputColor para texto
export function getMostContrastBlackOrWhite(inputColor: string): string {
	const textColorCandidates = ['#000000', '#FFFFFF']; // Cores de texto candidatas (preto e branco)
	const inputColorObj = tinycolor(inputColor);

	let bestTextColor = '';
	let maxContrastRatio = -1;

	for (const textColor of textColorCandidates) {
		const textColorObj = tinycolor(textColor);
		const contrastRatio = tinycolor.readability(inputColorObj, textColorObj);

		if (contrastRatio > maxContrastRatio) {
			maxContrastRatio = contrastRatio;
			bestTextColor = textColor;
		}
	}

	return bestTextColor;
}

// Function that will calculate the color of the shadow based on the saturation of the inputColor
export function getShadowColor(inputColor: string): string {
	const luminance = tinycolor(inputColor).getLuminance();
	const saturation = tinycolor(inputColor).toHsv().s;

	// Se a cor tiver luminancia baixa
	if (luminance < 0.5) {
		// retorna branco
		return 'rgba(255, 255, 255, 0.4)';
	} else if (saturation > 0.1 && saturation < 0.5) {
		// se tiver saturação baixa, retorna cor saturada
		return getSaturated(inputColor);
	} else {
		return 'rgba(0, 0, 0, 0.4)';
	}
}
