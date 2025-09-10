'use client';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { FlowAgentEditorType } from '@/core/shared/gql-api-schema';
import React, { ReactNode } from 'react';
import AdvancedStepsContent from './advanced';
import DefaultStepsContent from './default';

export type StepsProps = {
	title: string;
	description?: string;
	content: ReactNode;
};

interface Props {
	editor: FlowAgentEditorType;
}

const Instructions = ({ editor }: Props) => {
	const t = useTranslations('flow.agents.editor.instructions');
	const [open, setIsOpen] = React.useState(false);
	const [step, setStep] = React.useState(0); // state to track current step

	const stepsContent =
		editor === FlowAgentEditorType.Standard
			? DefaultStepsContent
			: [...AdvancedStepsContent, ...DefaultStepsContent];

	return (
		<>
			<Button
				variant="ghost"
				className="w-full"
				size="sm"
				onClick={() => {
					setIsOpen(true);
					setStep(0);
				}}>
				<AlertCircle size={16} className="text-foreground mr-3" />
				{t('label')}
			</Button>

			<Dialog open={open} onOpenChange={setIsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-foreground font-bold">
							{stepsContent[step].title}
						</DialogTitle>
						{stepsContent[step].description && (
							<DialogDescription>{stepsContent[step].description}</DialogDescription>
						)}
					</DialogHeader>
					<div>{stepsContent[step].content}</div>
					<DialogFooter>
						{step > 0 && (
							<Button variant="secondary" onClick={() => setStep(step - 1)}>
								{t('previous')}
							</Button>
						)}

						{step < stepsContent.length - 1 ? (
							<Button variant="default" onClick={() => setStep(step + 1)}>
								{t('next')}
							</Button>
						) : (
							<Button variant="default" onClick={() => setIsOpen(false)}>
								{t('close')}
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default Instructions;
