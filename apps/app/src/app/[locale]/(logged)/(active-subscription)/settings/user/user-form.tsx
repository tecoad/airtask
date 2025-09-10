'use client';

import { useForm } from 'react-hook-form';

import { CustomButton } from '@/components/custom-button';
import { FormActionsContainer } from '@/components/form-actions-container';
import { InputField } from '@/components/forms/input';
import { RowGrid } from '@/components/forms/row-grid';
import { SelectField } from '@/components/forms/select';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { WithConfirmAction } from '@/components/with-confirm-action';
import { i18nLanguageCodeToGql } from '@/core/helpers/gql-language-code-to-i18n';
import { useDisclosure } from '@/core/hooks/useDisclosure';
import { LanguageCode } from '@/core/shared/gql-api-schema';
import { useUser } from '@/lib';
import {
	UserSettingsFormValues,
	useSetupUserSettingsForm,
	useUserSettingsForm,
} from '@/lib/user/hooks';
import { locales } from '@/translations';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';

export function ProfileForm() {
	const { defaultValues, schema } = useSetupUserSettingsForm();
	const methods = useForm<UserSettingsFormValues>({
		defaultValues,
		resolver: yupResolver(schema as any),
	});
	const { user, isUserLoading } = useUser();
	const {
		formState: { isDirty, isSubmitting },
	} = methods;
	const { onSubmit, resetFormFromData } = useUserSettingsForm(methods);

	const formSubmit = methods.handleSubmit(onSubmit);
	const { isOpen, onClose, onOpen } = useDisclosure();
	const shouldConfirmPassword =
		!!methods.watch('password') || methods.watch('email') !== user?.email;

	const t = useTranslations('settings.user');
	return (
		<Form {...methods}>
			<form
				onReset={(e) => {
					e.preventDefault();
					user && resetFormFromData(user);
				}}
				onSubmit={(e) => {
					e.preventDefault();

					if (shouldConfirmPassword) {
						onOpen();
						return;
					}

					formSubmit(e);
				}}
				className="space-y-4">
				<RowGrid>
					<InputField
						control={methods.control}
						label={t('firstname')}
						name="first_name"
						skeletonMode={isUserLoading}
					/>
					<InputField
						control={methods.control}
						label={t('lastname')}
						name="last_name"
						skeletonMode={isUserLoading}
					/>
				</RowGrid>

				<InputField
					control={methods.control}
					label={t('email')}
					name="email"
					skeletonMode={isUserLoading}
				/>

				<SelectField
					control={methods.control}
					name="language"
					skeletonMode={isUserLoading}
					label={t('language')}
					items={locales.map((v) => {
						const value = i18nLanguageCodeToGql[v];

						return {
							label:
								value === LanguageCode.En
									? t('languages.english')
									: value === LanguageCode.Pt
									? t('languages.portuguese')
									: '',
							value,
						};
					})}
				/>

				<RowGrid>
					<InputField
						control={methods.control}
						label={t('password')}
						name="password"
						skeletonMode={isUserLoading}
						type="password"
					/>
					<InputField
						control={methods.control}
						label={t('confirmPassword')}
						name="confirm_password"
						skeletonMode={isUserLoading}
						type="password"
					/>
				</RowGrid>

				<FormActionsContainer>
					<CustomButton type="reset" variant="secondary" disabled={!isDirty}>
						{t('cancel')}
					</CustomButton>

					<WithConfirmAction
						title={t('confirmChange.title')}
						description={t('confirmChange.subtitle')}
						content={
							<form>
								<div className="grid gap-4 py-4">
									<div className="grid grid-cols-6 items-center gap-4">
										<Label htmlFor="name" className="col-span-2 text-right leading-4">
											{t('confirmChange.currentPassword')}
										</Label>
										<InputField
											control={methods.control}
											name="old_password"
											className="col-span-4"
											skeletonMode={isUserLoading}
											type="password"
											extra={{
												autoFocus: true,
												onKeyDown(e) {
													if (e.key === 'Enter') {
														e.preventDefault();
														formSubmit();
													}
												},
											}}
										/>
									</div>
								</div>
							</form>
						}
						isActive={shouldConfirmPassword}
						isConfirming={isSubmitting}
						onConfirm={async () => {
							const isValid = await methods.trigger('old_password');

							if (isValid) {
								await formSubmit();

								const stateAfterSubmit = methods.getFieldState('old_password');
								if (!stateAfterSubmit.invalid) {
									onClose();
								}
							}
						}}
						autoCloseOnConfirm={false}
						disclosure={{
							isOpen,
							onClose,
							onOpen,
						}}
						confirmLabel={t('confirmChange.confirm')}>
						<CustomButton
							disabled={!isDirty}
							loading={!shouldConfirmPassword && isSubmitting}
							type="submit">
							{t('save')}
						</CustomButton>
					</WithConfirmAction>
				</FormActionsContainer>
			</form>
		</Form>
	);
}
