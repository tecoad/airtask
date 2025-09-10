import { CustomButton } from '@/components/custom-button';
import { InputField } from '@/components/forms/input';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { FlowAgentFormValues, useFlowAgentForm } from '@/lib/flow-agent/hooks';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

type Props = {
	isOpen: boolean;
	onOpenChange: (v: boolean) => void;
};

export const UpdateAgentTitle = ({ isOpen, onOpenChange }: Props) => {
	const t = useTranslations('flow.agents.editor.agentActions.updateTitle');
	const methods = useFormContext<FlowAgentFormValues>();
	const { onSubmit } = useFlowAgentForm(methods);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t('updateTitle')}</DialogTitle>
					<DialogDescription></DialogDescription>
				</DialogHeader>
				<InputField control={methods.control} name="title" label={t('title')} />

				<DialogFooter>
					<CustomButton
						onClick={() => {
							methods.handleSubmit(onSubmit)();
							onOpenChange(false);
						}}>
						{t('save')}
					</CustomButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
