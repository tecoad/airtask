import { getLightOrDark } from '@/lib/color-utils';
import tinycolor from 'tinycolor2';

interface Props {
	chatColor: string;
	onColorChange: (newColor: string) => void;
	visible?: boolean;
}

const ColorInspector = ({ chatColor, onColorChange, visible }: Props) => {
	const handleInputChange = (event) => {
		const newColor = event.target.value;
		onColorChange(newColor);
	};

	const color = tinycolor(chatColor);
	const saturation = color.toHsv().s;
	const lightOrDark = getLightOrDark(color);
	const luminance = color.getLuminance();
	const brightness = color.getBrightness();

	return (
		visible && (
			<>
				<input
					type="text"
					className="wdg-color-gradient wdg-text-center wdg-p-1 wdg-m-2 "
					onChange={handleInputChange}
					value={chatColor} // Set the input value to chatColor
				/>
				<div className="wdg-text-center wdg-p-1 wdg-m-2">
					<div>Light or Dark: {lightOrDark}</div>
					<div>Luminance: {luminance}</div>
					<div>Saturation: {saturation}</div>
					<div>Brightness: {brightness}</div>
				</div>
			</>
		)
	);
};

export default ColorInspector;
