import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlowAgentVoice } from '@/core/shared/gql-api-schema';
import { FlowAgentFormValues } from '@/lib/flow-agent/hooks';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';

const GenderSelector = () => {
	const t = useTranslations('flow.agents.editor.voice');
	const { control } = useFormContext<FlowAgentFormValues>();

	return (
		<div className="grid gap-2">
			<HoverCard openDelay={200}>
				<HoverCardTrigger asChild>
					<Label>{t('label')}</Label>
				</HoverCardTrigger>
				<HoverCardContent className="w-[320px] text-sm" side="left">
					{t('description')}
				</HoverCardContent>
			</HoverCard>
			<Controller
				control={control}
				name="voice"
				render={({ field }) => (
					<Tabs value={field.value} onValueChange={field.onChange}>
						<TabsList className="grid grid-cols-2">
							<TabsTrigger value={FlowAgentVoice.Male}>
								<span>{t('male')}</span>
							</TabsTrigger>
							<TabsTrigger value={FlowAgentVoice.Female}>
								<span>{t('female')}</span>
							</TabsTrigger>
						</TabsList>
					</Tabs>
				)}
			/>
		</div>
	);
};

export default GenderSelector;
