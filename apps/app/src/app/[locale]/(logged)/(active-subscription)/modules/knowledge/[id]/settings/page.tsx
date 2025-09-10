import { SectionTitle } from '@/components/section-title';
import { getKnowledgeBase } from '@/lib/knowledge/server';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { DeleteKnowledgeFormContent } from './delete-knowledge-form';
import { KnowledgeSettingsFormContent } from './knowledge-settings-form';

export type Props = {
	params: {
		id: string;
	};
};

const Page = ({ params }: Props) => {
	const t = useTranslations('quotation.settings');

	return (
		<>
			<SectionTitle title={t('title')} subtitle={t('subtitle')} />

			<Suspense>
				<KnowledgeSettingsForm id={params.id} />
			</Suspense>

			<Suspense>
				<DeleteKnowledgeForm id={params.id} />
			</Suspense>
		</>
	);
};

const DeleteKnowledgeForm = async ({ id }: { id: string }) => {
	return <DeleteKnowledgeFormContent knowledgeBase={await getKnowledgeBase(id)} />;
};

const KnowledgeSettingsForm = async ({ id }: { id: string }) => {
	return <KnowledgeSettingsFormContent knowledgeBase={await getKnowledgeBase(id)} />;
};

export default Page;
