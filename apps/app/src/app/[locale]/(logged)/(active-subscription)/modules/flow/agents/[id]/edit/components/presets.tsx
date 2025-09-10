import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { presets } from '../data/presets';
import { PresetSelector } from './preset-selector';

const Presets = () => {
	const t = useTranslations('flow.agents.editor');

	return (
		<div className="grid gap-2">
			<Label>{t('loadPreset')}</Label>
			<PresetSelector presets={presets} />
		</div>
	);
};

export default Presets;
