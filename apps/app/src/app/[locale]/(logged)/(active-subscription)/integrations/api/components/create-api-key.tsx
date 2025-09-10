'use client';
import { CopyButton } from '@/components/copy-button';
import { CustomButton } from '@/components/custom-button';
import { InputField } from '@/components/forms/input';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sleep } from '@/core';
import { useDisclosure } from '@/core/hooks/useDisclosure';
import { useCreateAccountApiKey } from '@/lib/account-api-key/hooks';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

export const CreateApiKey = () => {
	const t = useTranslations('integrations.api.keys.create');
	const create = useCreateAccountApiKey();
	const methods = useForm<{
		created?: {
			apiKey: string;
		};
		name?: string;
	}>();
	const { isSubmitting } = methods.formState;
	const apiKey = methods.watch('created.apiKey');
	const { isOpen, onOpen, onClose } = useDisclosure();

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(v) => {
				v ? onOpen() : onClose();

				if (!v) methods.reset();
			}}>
			<DialogTrigger asChild>
				<CustomButton variant="outline">{t('createNew')}</CustomButton>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<Form {...methods}>
					<form
						className="contents"
						onSubmit={methods.handleSubmit(async ({ name, created }) => {
							if (created) {
								onClose();

								await Sleep(300);
								methods.reset();
								return;
							}

							const result = await create(name);

							methods.setValue('created', {
								apiKey: result?.token!,
							});
						})}>
						<DialogHeader>
							<DialogTitle>{t('createNew')}</DialogTitle>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							{apiKey ? (
								<>
									{t('apiKeyCreatedExplanation')}

									<div className="flex items-center gap-2 ">
										<Input value={apiKey} readOnly />
										<div className="flex items-center">
											<CopyButton
												useOnlyIcon
												copyContent={apiKey}
												extra={{
													className: 'h-8 w-8 rounded-full',
													variant: 'default',
													size: 'icon',
												}}
												iconProps={{
													size: 14,
													strokeWidth: 2,
													className: '',
												}}
											/>
										</div>
									</div>
								</>
							) : (
								<InputField
									control={methods.control}
									label={t('name')}
									placeholder={t('namePlaceholder')}
									name="name"
									optional={t('optional')}
								/>
							)}
						</div>
						<DialogFooter>
							<CustomButton type="submit" loading={isSubmitting}>
								{apiKey ? t('close') : t('create')}
							</CustomButton>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
