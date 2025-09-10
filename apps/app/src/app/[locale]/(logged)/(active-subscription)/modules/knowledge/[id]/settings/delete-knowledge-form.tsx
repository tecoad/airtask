'use client';

import { DeletionCard } from '@/components/deletion-card';
import { KnowledgeBaseFragment } from '@/core/shared/gql-api-schema';
import { useDeleteKnowledge } from '@/lib/knowledge/hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FieldValues, useForm } from 'react-hook-form';
import * as Yup from 'yup';

type Props = {
	knowledgeBase: KnowledgeBaseFragment;
};

export const DeleteKnowledgeFormContent = ({ knowledgeBase }: Props) => {
	const t = useTranslations('flow.knowledge.edit');

	const router = useRouter();
	const { deleteKnowledge } = useDeleteKnowledge();
	const schema = Yup.object({
		instanceName: Yup.string().test(
			'is-valid',
			t('titleDontMatch'),
			(v) => v === knowledgeBase.title,
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
		await deleteKnowledge(knowledgeBase.id);
		router.push('/modules/knowledge');
	});

	return (
		<DeletionCard
			onSubmit={onSubmit}
			isValid={isValid}
			methods={methods}
			title={knowledgeBase.title}
			type={t('knowledgeBase')}
		/>
	);
};
