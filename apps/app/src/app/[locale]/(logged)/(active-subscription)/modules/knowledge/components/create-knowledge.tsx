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
import { useCreateKnowledgeBase } from '@/lib/knowledge/hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

export const CreateNewKnowledgeBase = () => {
	const { isCreateModalOpen, setIsCreateModalOpen } = useSwitchContext();
	const t = useTranslations('flow.knowledge.create');
	const router = useRouter();
	const methods = useForm<{ title: string }>({
		resolver: yupResolver(
			Yup.object({
				title: Yup.string().required(t('errors.title.required')),
			}),
		),
	});
	const {
		formState: { isSubmitting },
	} = methods;
	const { create } = useCreateKnowledgeBase();

	return (
		<>
			<CreateButton onClick={() => setIsCreateModalOpen(true)} />

			<Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
				<DialogContent>
					<Form {...methods}>
						<form
							onSubmit={methods.handleSubmit(async (values) => {
								const item = await create(values.title);
								setIsCreateModalOpen(false);

								item && router.push(`/modules/knowledge/${item.id}/edit`);
							})}>
							<DialogHeader>
								<DialogTitle>{t('title')}</DialogTitle>
								<DialogDescription>{t('subtitle')}</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-2 pb-4">
								<div className="space-y-2">
									<Label htmlFor="name">{t('knowledgeTitle')}</Label>
									<InputField
										control={methods.control}
										name="title"
										placeholder={t('insertKnowledgeTitle')}
									/>
								</div>
							</div>
							<DialogFooter className="flex flex-row gap-2 ">
								<CustomButton
									className="flex-grow"
									variant="outline"
									onClick={() => setIsCreateModalOpen(false)}>
									{t('dismiss')}
								</CustomButton>
								<CustomButton className="flex-grow" type="submit" loading={isSubmitting}>
									{t('createKnowledgeBase')}
								</CustomButton>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</>
	);
};
