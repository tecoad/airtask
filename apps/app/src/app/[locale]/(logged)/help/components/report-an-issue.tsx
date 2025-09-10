'use client';

import { Label } from '@/components/ui/label';
import { useUser } from '@/lib';
import { useHelpForm } from '@/lib/help/hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { CustomButton } from '../../../../../components/custom-button';
import { FormActionsContainer } from '../../../../../components/form-actions-container';
import { InputField } from '../../../../../components/forms/input';
import { Form } from '../../../../../components/ui/form';

export function ReportAnIssue() {
	const { user, isUserLoading } = useUser();
	const t = useTranslations('help');

	const form = useForm<{
		email: string;
		subject: string;
		message: string;
	}>({
		resolver: yupResolver(
			Yup.object({
				email: Yup.string().required().email(t('form.errors.email')),
				subject: Yup.string().required(),
				message: Yup.string().required(),
			}) as any,
		),
		defaultValues: {
			email: user?.email,
		},
	});
	const {
		formState: { isSubmitting },
	} = form;

	const { exec, ticketId } = useHelpForm();

	useEffect(() => {
		user && form.setValue('email', user.email);
	}, [user]);

	return (
		<Form {...form}>
			<form
				// className="contents"
				onSubmit={form.handleSubmit(exec)}>
				<div className="grid gap-6 ">
					{ticketId ? (
						<p className="text-muted-foreground ">
							{t('submited', { ticket: ticketId })}
						</p>
					) : (
						<>
							<div className="grid gap-2">
								<Label htmlFor="email">{t('form.email')}</Label>
								<InputField
									control={form.control}
									skeletonMode={isUserLoading}
									name="email"
									placeholder={t('form.emailPlaceholder')}
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="subject">{t('form.subject')}</Label>
								<InputField
									control={form.control}
									skeletonMode={isUserLoading}
									name="subject"
									placeholder={t('form.subjectPlaceholder')}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="description">{t('form.issue')}</Label>

								<InputField
									skeletonMode={isUserLoading}
									asTextArea
									control={form.control}
									name="message"
									placeholder={t('form.issuePlaceholder')}
								/>
							</div>
						</>
					)}
				</div>

				<FormActionsContainer>
					<CustomButton type="submit" loading={isSubmitting} disabled={isUserLoading}>
						{t('form.submit')}
					</CustomButton>
				</FormActionsContainer>
			</form>
		</Form>
	);
}
