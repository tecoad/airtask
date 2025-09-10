import { PopoverSelectField } from '@/components/forms/popover-select';
import { LANGUAGES_CODES } from '@/lib/flow-agent/data';
import { FlowAgentFormValues } from '@/lib/flow-agent/hooks';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';
import GenderSelector from './gender.selector';
import Instructions from './instructions/steps';
import { KnowledgeSelector } from './knowledge-selector';
import ModeSelector from './mode-selector';
import { TalkToAgent } from './talk-to-agent';

const Settings = () => {
	const t = useTranslations('flow.agents.editor');
	const { control } = useFormContext<FlowAgentFormValues>();

	return (
		<div className="sticky top-6 flex-col space-y-4 ">
			{/* <Presets /> */}

			<ModeSelector />

			<KnowledgeSelector />

			<Controller
				control={control}
				name="script_language"
				render={({ field }) => {
					return (
						<PopoverSelectField
							control={control}
							items={LANGUAGES_CODES.map((v) => ({
								label: v.name,
								value: v.code,
							}))}
							label={t('scriptLanguage')}
							name="script_language"
						/>
					);
				}}
			/>

			<GenderSelector />

			{/* <ActionsSelector types={types} actions={actions} /> */}

			<TalkToAgent />

			<Controller
				control={control}
				name="editor_type"
				render={({ field }) => <Instructions editor={field.value} />}
			/>
		</div>
	);
};

export default Settings;
