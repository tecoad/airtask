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
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

export const CreateNewQuotation = () => {
	const t = useTranslations('quotation.create');
	const router = useRouter();
	const methods = useForm<{ title: string }>({
		resolver: yupResolver(
			Yup.object({
				title: Yup.string().required(t('errors.title.required')),
			}),
		),
	});

	const { isCreateModalOpen, setIsCreateModalOpen } = useSwitchContext();

	return (
		<>
			<CreateButton onClick={() => setIsCreateModalOpen(true)} />

			<Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
				<DialogContent>
					<Form {...methods}>
						<form
							onSubmit={methods.handleSubmit((values) => {
								router.push('/modules/quotation/create?title=' + values.title);
								setIsCreateModalOpen(false);
							})}>
							<DialogHeader>
								<DialogTitle>{t('title')}</DialogTitle>
								<DialogDescription>{t('subtitle')}</DialogDescription>
							</DialogHeader>
							<div>
								<div className="space-y-4 py-2 pb-4">
									<div className="space-y-2">
										<Label htmlFor="name">{t('instanceTitle')}</Label>
										<InputField
											control={methods.control}
											name="title"
											placeholder={t('instanceTitlePlaceholder')}
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
									{t('createInstance')}
								</CustomButton>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</>
	);
};
