import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlowAgentEditorType } from '@/core/shared/gql-api-schema';
import { FlowAgentFormValues } from '@/lib/flow-agent/hooks';

import { List, TerminalSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';

const ModeSelector = () => {
	const t = useTranslations('flow.agents.editor');
	const { control } = useFormContext<FlowAgentFormValues>();

	return (
		<div className="grid gap-2">
			<HoverCard openDelay={200}>
				<HoverCardTrigger asChild>
					<Label>{t('mode.label')}</Label>
				</HoverCardTrigger>
				<HoverCardContent className="w-[320px] text-sm" side="left">
					{t('mode.description')}
				</HoverCardContent>
			</HoverCard>
			<Controller
				control={control}
				name="editor_type"
				render={({ field }) => (
					<Tabs value={field.value} className="pointer-events-none opacity-50">
						<TabsList className="grid grid-cols-2">
							<TabsTrigger value={FlowAgentEditorType.Standard}>
								<span className="sr-only">{t('mode.standard')}</span>
								<List className="h-5 w-5" />
							</TabsTrigger>
							<TabsTrigger value={FlowAgentEditorType.Advanced}>
								<span className="sr-only">{t('mode.advanced')}</span>
								<TerminalSquare className="h-5 w-5" />
							</TabsTrigger>
						</TabsList>
					</Tabs>
				)}
			/>
		</div>
	);
};

export default ModeSelector;
