'use client';

import { CustomButton } from '@/components/custom-button';
import { useDisclosure } from '@/core/hooks/useDisclosure';
import {
	KnowledgeBaseFragment,
	KnowledgeBaseQaFragment,
} from '@/core/shared/gql-api-schema';
import { useListKnowledgeBases } from '@/lib/knowledge/hooks';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import EditOrCreateQuestion from './edit-or-create-question';
import Question from './question';

export const Knowledge = ({ data: initialData }: { data: KnowledgeBaseFragment }) => {
	const [data, setData] = useState<KnowledgeBaseFragment>(initialData);
	const t = useTranslations('flow.knowledge.create');
	const params = useParams();

	const { data: allKnowledgeBases, isLoading } = useListKnowledgeBases();

	const { isOpen, onOpen, onClose } = useDisclosure();

	const [editItem, setEditItem] = useState<KnowledgeBaseQaFragment>();

	return (
		<>
			{/* <SectionTitle title={t('addQuestion')} subtitle={t('addQuestionDescription')} /> */}

			<div className="grid auto-rows-fr grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
				{data.qa.map((item, index) => (
					<Question
						key={index}
						item={item}
						onEdit={() => {
							setEditItem(item);
							onOpen();
						}}
						onDelete={() => {
							setData((prev) => ({
								...prev,
								qa: prev.qa.filter((v) => v.id !== item.id),
							}));
						}}
					/>
				))}

				<div className="flex  min-h-[200px] items-center  justify-center rounded-lg border-2 border-dashed bg-transparent p-5">
					<CustomButton
						className="h-14 w-14 rounded-full"
						size="icon"
						onClick={() => {
							setEditItem(undefined);
							onOpen();
						}}>
						<Plus size={32} />
					</CustomButton>
				</div>

				<EditOrCreateQuestion
					isOpen={isOpen}
					onClose={() => {
						setEditItem(undefined);
						onClose();
					}}
					item={editItem}
					knowledgeBases={allKnowledgeBases || []}
					isKnowledgeBaseLoading={isLoading}
					onCreate={(item) => {
						setData((prev) => ({
							...prev,
							qa: [...prev.qa, item],
						}));
						onClose();
					}}
					onEdit={(item) => {
						setData((prev) => ({
							...prev,
							qa: prev.qa.flatMap((v) => {
								const updated = v.id === item.id ? item : v;

								if (!updated.knowledge_base.find((item) => item.id === params.id)) {
									return [];
								}

								return updated;
							}),
						}));
						setEditItem(undefined);
						onClose();
					}}
				/>
			</div>
		</>
	);
};
