'use client';

import { DeletionCard } from '@/components/deletion-card';
import { QuotationMetricsFragment } from '@/core/shared/gql-api-schema';
import { useDeleteQuotation } from '@/lib';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FieldValues, useForm } from 'react-hook-form';
import * as Yup from 'yup';

type Props = {
	quotation: QuotationMetricsFragment;
};

export const DeleteQuotationForm = ({ quotation }: Props) => {
	const t = useTranslations('quotation.settings');

	const router = useRouter();
	const { deleteQuotation } = useDeleteQuotation();
	const schema = Yup.object({
		instanceName: Yup.string().test(
			'is-valid',
			t('titleDontMatch'),
			(v) => v === quotation.title,
		),
	});
	const methods = useForm<FieldValues>({
		resolver: yupResolver(schema as any),
		mode: 'onBlur',
	});
	const {
		formState: { isValid },
	} = methods;

	const onSubmit = methods.handleSubmit(async () => {
		await deleteQuotation(quotation.id);
		router.push('/modules/quotation');
	});

	return (
		<DeletionCard
			onSubmit={onSubmit}
			isValid={isValid}
			methods={methods}
			title={quotation.title}
			type={t('quotation')}
		/>
	);
};
