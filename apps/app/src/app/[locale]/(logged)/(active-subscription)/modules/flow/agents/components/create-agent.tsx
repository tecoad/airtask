'use client';

import CreateButton from '@/components/create-button';
import { CustomButton } from '@/components/custom-button';
import { InputField } from '@/components/forms/input';
import { useSwitchContext } from '@/components/switcher';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

export const CreateNewAgent = () => {
	const t = useTranslations('flow.agents.create');
	const router = useRouter();
	const methods = useForm<{ title: string }>({
		resolver: yupResolver(
			Yup.object({
				title: Yup.string().required(t('errors.title.required')),
			}),
		),
	});
	const queryParams = useSearchParams();
	const { isCreateModalOpen, setIsCreateModalOpen } = useSwitchContext();

	return (
		<>
			<CreateButton onClick={() => setIsCreateModalOpen(true)} />

			<Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
				<DialogContent>
					<Form {...methods}>
						<form
							onSubmit={methods.handleSubmit((values) => {
								router.push(
									`/modules/flow/agents/create?title=${
										values.title
									}&${queryParams.toString()}`,
								);

								setIsCreateModalOpen(false);
							})}>
							<DialogHeader>
								<DialogTitle>{t('title')}</DialogTitle>
								<DialogDescription>{t('subtitle')}</DialogDescription>
							</DialogHeader>
							<div>
								<div className="space-y-4 py-2 pb-4">
									<div className="space-y-2">
										<Label htmlFor="name">{t('agentName')}</Label>
										<InputField
											control={methods.control}
											name="title"
											placeholder={t('agentNamePlaceholder')}
										/>
									</div>
									<div className="space-y-2"></div>
								</div>
							</div>
							<DialogFooter className="flex flex-row gap-2 ">
								<CustomButton
									className="flex-grow"
									variant="outline"
									onClick={() => setIsCreateModalOpen(false)}>
									{t('dismiss')}
								</CustomButton>
								<CustomButton className="flex-grow" type="submit">
									{t('createAgent')}
								</CustomButton>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</>
	);
};
