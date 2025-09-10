'use client';

import { CustomButton } from '@/components/custom-button';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { FlowAgentFragment } from '@/core/shared/gql-api-schema';
import {
	FlowAgentFormValues,
	useFlowAgentForm,
	useSetupFlowAgentForm,
} from '@/lib/flow-agent/hooks';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { AgentActions } from './agent-actions';
import Editor from './editor/editor';
import Settings from './settings';

export const FlowAgentForm = ({ data }: { data: FlowAgentFragment }) => {
	const t = useTranslations('flow.agents.editor');
	const { defaultValues, schema } = useSetupFlowAgentForm(data);
	const methods = useForm<FlowAgentFormValues>({
		// resolver: yupResolver(schema as any),
		defaultValues,
	});
	const {
		formState: { isSubmitting, isDirty },
	} = methods;
	const { onSubmit } = useFlowAgentForm(methods, data);

	return (
		<Form {...methods}>
			<form className="contents" onSubmit={methods.handleSubmit(onSubmit)}>
				{/* <Title title={t('title', { name: `'${data.title}'` })} /> */}
				<Tabs defaultValue="standard">
					<div className="grid items-start gap-6 md:grid-cols-[1fr_300px]">
						<TabsContent
							value="standard"
							className="mt-0 flex h-full flex-col space-y-4 border-0 p-0">
							<div className="flex flex-col gap-2">
								<Label>{t('prompt')}</Label>
								<Editor data={data} />
							</div>

							<div className="flex justify-end gap-2">
								<CustomButton type="submit" loading={isSubmitting} disabled={!isDirty}>
									{t('save')}
								</CustomButton>
								<AgentActions />
							</div>
						</TabsContent>

						<Settings />
					</div>
				</Tabs>
			</form>
		</Form>
	);
};
