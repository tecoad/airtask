'use client';
import { CopyButton } from '@/components/copy-button';
import { CustomButton } from '@/components/custom-button';
import { FormActionsContainer } from '@/components/form-actions-container';
import { InputField } from '@/components/forms/input';
import { RowGrid } from '@/components/forms/row-grid';
import { SelectField } from '@/components/forms/select';
import { Form } from '@/components/ui/form';
import { WithConfirmAction } from '@/components/with-confirm-action';
import { ENV } from '@/core/config/env';
import { useDisclosure } from '@/core/hooks/useDisclosure';
import { AffiliatePayoutMethod } from '@/core/shared/gql-api-schema';
import {
	ManageAffiliateFormValues,
	useManageAffiliateForm,
	useManageAffiliateFormAliasAvailability,
	useSetupManageAffiliateForm,
} from '@/lib';
import { sanitizeName } from '@/lib/sign/helpers';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

export function AffiliateForm() {
	const t = useTranslations('affiliates.settings');
	const { defaultValues, schema } = useSetupManageAffiliateForm();
	const methods = useForm<ManageAffiliateFormValues>({
		defaultValues,
		resolver: yupResolver(schema as any),
		mode: 'all',
	});
	const { isDataLoading, onSubmit, data, isEdit, reset } =
		useManageAffiliateForm(methods);
	const { isCheckingAlias } = useManageAffiliateFormAliasAvailability({
		data,
		form: methods,
	});
	const { isSubmitting, isDirty } = methods.formState;
	const [alias, payoutMethod] = methods.watch(['alias', 'payout_method']);

	const formSubmit = methods.handleSubmit(onSubmit);
	const shouldConfirmSubmitForAlias = isEdit && data && alias !== data.alias;

	const isSubmitDisabled =
		!isDirty || isCheckingAlias || methods.watch('isAliasAvailable') !== true;

	const { isOpen, onClose, onOpen } = useDisclosure();

	return (
		<Form {...methods}>
			<form
				onSubmit={(e) => {
					if (isSubmitDisabled) {
						e.preventDefault();
						return;
					}

					// need to confirm
					if (shouldConfirmSubmitForAlias) {
						// not confirmed, open dialog
						e.preventDefault();
						onOpen();

						return;
					}

					// doesn't need to confirm, just submit
					formSubmit(e);
				}}
				onReset={(e) => {
					e.preventDefault();

					data && reset(data);
				}}
				className="space-y-8">
				<InputField
					skeletonMode={isDataLoading}
					label={t('form.alias')}
					name="alias"
					control={methods.control}
					description={
						<div
							className={`flex flex-wrap items-center gap-2 ${
								alias ? 'opacity-100' : 'opacity-0'
							} ${isDataLoading ? 'is-skeleton' : undefined}`}>
							<div>
								{t('form.yourUrl')} &nbsp;
								<span className={isDataLoading ? '' : 'text-foreground font-semibold'}>
									{ENV.AFFILIATE.url(alias)}
								</span>
							</div>
							<CopyButton
								extra={{
									type: 'button',
								}}
								copyText={t('form.copyUrl')}
								copiedText={t('form.copiedUrl')}
								copyContent={ENV.AFFILIATE.url(alias)}
							/>
						</div>
					}
					isLoading={isCheckingAlias}
				/>

				<RowGrid className="grid-cols-5">
					<SelectField
						skeletonMode={isDataLoading}
						control={methods.control}
						name="payout_method"
						label={t('form.payout_method')}
						className="col-span-2"
						items={[
							{
								label: sanitizeName(AffiliatePayoutMethod.Pix),
								value: AffiliatePayoutMethod.Pix,
							},
							{
								label: sanitizeName(AffiliatePayoutMethod.Paypal),
								value: AffiliatePayoutMethod.Paypal,
							},
						]}
						placeholder={t('form.payout_placeholder')}
					/>

					{payoutMethod && (
						<InputField
							skeletonMode={isDataLoading}
							control={methods.control}
							// label={t(`form.payout_method_key.${payoutMethod}`)}

							label={
								payoutMethod === AffiliatePayoutMethod.Pix
									? t(`form.payout_method_key.pix`)
									: t(`form.payout_method_key.paypal`)
							}
							name="payout_method_key"
							className="col-span-3"
						/>
					)}
				</RowGrid>

				<InputField
					skeletonMode={isDataLoading}
					control={methods.control}
					label={t('form.confirmPassword')}
					name="password"
					type="password"
				/>

				<FormActionsContainer>
					<CustomButton type="reset" variant="secondary" disabled={!isDirty}>
						{t('form.dismiss')}
					</CustomButton>

					<WithConfirmAction
						isActive={shouldConfirmSubmitForAlias}
						title={t('form.confirmSubmit.title')}
						description={t('form.confirmSubmit.description')}
						isAlert
						onConfirm={formSubmit}
						confirmLabel={t('form.confirmSubmit.confirm')}>
						<CustomButton
							loading={isSubmitting}
							type="submit"
							disabled={isSubmitDisabled}>
							{t('form.save')}
						</CustomButton>
					</WithConfirmAction>
				</FormActionsContainer>
			</form>
		</Form>
	);
}
