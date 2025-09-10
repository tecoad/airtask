'use client';

import { CustomButton } from '@/components/custom-button';
import { FormActionsContainer } from '@/components/form-actions-container';
import { Title } from '@/components/title';
import { Form } from '@/components/ui/form';
import { CONSTANTS } from '@/core/config/constants';
import { useCreateFlowAgent } from '@/lib/flow-agent/hooks';
import { useMachine } from '@xstate/react';
import { useTranslations } from 'next-intl';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import CreationType from './_steps/creation-type';
import EditingMode from './_steps/editing-mode';
import { AvailableStates, UserChoicesContext, getMachine } from './_steps/machine';
import ServiceType from './_steps/service-type';
import { StepHandleProps } from './_steps/types';
import UseCase from './_steps/use-case';

export default function SettingsLayout() {
	const f = useForm();
	const router = useRouter();
	const queryParams = useSearchParams();

	const { exec } = useCreateFlowAgent();
	const [state, send] = useMachine(getMachine, {
		actions: {
			redirectToEdit(ctx, event) {
				const redirectParam = queryParams.get(CONSTANTS.queryParams.redirect);
				if (redirectParam) {
					router.push(redirectParam);
					return;
				}

				router.push(`/modules/flow/agents/${event.data.id}/edit`);
			},
		},
		services: {
			'Create Agent': async (ctx) => {
				const result = await exec({
					editor_type: ctx.editor!,
				});

				return result!;
			},
		},
	});

	const query = useSearchParams();
	const title = query.get('title');
	const t = useTranslations('flow.agents');
	if (!title) return notFound();

	const getChangeHandler = (name: keyof UserChoicesContext): StepHandleProps => {
		return {
			value: state.context.userChoices[name]!,
			onChange(v) {
				send({
					type: 'userChoicesChanged',
					values: {
						[name]: v,
					},
				});
			},
		};
	};

	const shouldShowStep = (stepStateName: AvailableStates) => {
		try {
			if (state.matches(stepStateName)) return true;

			if (state.matches('Creating agent')) {
				const lastStep = state.context.history[state.context.history.length - 1];

				return lastStep.state === stepStateName;
			}
		} catch {}
	};

	return (
		<>
			<Title
				title={t('instance.newInstance', { name: title })}
				subtitle={t('instance.newInstanceInstructions')}
			/>

			{/* <pre>{JSON.stringify(state.context.history, null, 2)}</pre> */}
			<Form {...f}>
				<form>
					{shouldShowStep('Selecting Use Case') && (
						<UseCase {...getChangeHandler('useCase')} />
					)}
					{shouldShowStep('Selecting Service Type') && (
						<ServiceType {...getChangeHandler('serviceType')} />
					)}
					{shouldShowStep('Selecting Editing Mode') && (
						<EditingMode {...getChangeHandler('editingMode')} />
					)}
					{shouldShowStep('Creation Type') && (
						<CreationType {...getChangeHandler('creationType')} />
					)}

					{/* Editor Picker Flow
					This is a flow for an agent creation process.
					The first step is mandatory: is use case. Options available: Sales, Customer Service and Other.
					The next step is Service type. Its optional, only appears if the user chooses Customer Service. Options available:General or Objective
					The next step is mandatory the editing mode. Options available: Standard or Advanced. 

					The last step is script creation type. But this doesnt appear if the user selected 'Customer Service' and 'General' and 'Standard' from last steps. Options available: Using AI / From Scratch. If “Using AI” is selected, the user is redirected to the editor with the query param ?use_ai, which will opens up the AI modal.

					Then the we will save the editor type in the instance:
					1. The Form Editor -  if he chooses all 'Customer Service' and 'General' and 'Standard' from the previous steps.
					2. The Text Editor -  if chooses 'Standard' editing mode. Except if it chooses also 'Customer Service' and 'General'.
					3. The Prompt Editor - if chooses 'Advanced' editing mode. */}

					<FormActionsContainer>
						{state.context.history.length > 1 && (
							<CustomButton
								variant="outline"
								onClick={() => {
									send('prev');
								}}>
								{t('prev')}
							</CustomButton>
						)}
						<CustomButton
							loading={state.matches('Creating agent')}
							onClick={() => {
								send('next');
							}}>
							{t('next')}
						</CustomButton>
					</FormActionsContainer>
				</form>
			</Form>
		</>
	);
}
