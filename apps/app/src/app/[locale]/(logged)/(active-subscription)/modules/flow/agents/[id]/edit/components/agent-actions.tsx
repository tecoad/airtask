'use client';

import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { CustomButton } from '@/components/custom-button';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { FlowAgentFormValues, useDeleteFlowAgent } from '@/lib/flow-agent/hooks';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useFormContext } from 'react-hook-form';
import { UpdateAgentTitle } from './update-title';

export function AgentActions() {
	const methods = useFormContext<FlowAgentFormValues>();
	const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
	const [showUpdateDialog, setShowUpdateDialog] = React.useState(false);
	const { exec, isLoading } = useDeleteFlowAgent();
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();
	const t = useTranslations('flow.agents.editor.agentActions');

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon">
						<span className="sr-only">{t('label')}</span>
						<DotsHorizontalIcon className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						onClick={async () => {
							await navigator.clipboard.writeText(methods.getValues('script') || '');
							toast({
								description: t('copyConfirm'),
							});
						}}>
						{t('copyPrompt')}
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={() => setShowUpdateDialog(true)}>
						{t('renameAgent')}
					</DropdownMenuItem>

					<DropdownMenuSeparator />
					<DropdownMenuItem
						onSelect={() => setShowDeleteDialog(true)}
						className="text-red-600">
						{t('delete.label')}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
						<AlertDialogDescription>{t('delete.description')}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t('delete.dismiss')}</AlertDialogCancel>
						<CustomButton
							variant="destructive"
							loading={isLoading}
							onClick={async () => {
								await exec(params.id as string);

								setShowDeleteDialog(false);
								toast({
									description: t('delete.confirm'),
								});

								router.push('/modules/flow/agents');
							}}>
							{t('delete.ok')}
						</CustomButton>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<UpdateAgentTitle isOpen={showUpdateDialog} onOpenChange={setShowUpdateDialog} />
		</>
	);
}
