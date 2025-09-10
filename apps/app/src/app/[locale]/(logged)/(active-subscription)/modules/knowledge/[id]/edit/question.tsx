import { CustomButton } from '@/components/custom-button';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { KnowledgeBaseQaFragment } from '@/core/shared/gql-api-schema';
import { generateThumb } from '@/lib/colors';
import { useDeleteKnowledgeBaseQa } from '@/lib/knowledge/hooks';
import { Edit, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface Props {
	item: KnowledgeBaseQaFragment;
	onEdit: () => Promise<void> | void;
	onDelete: () => Promise<void> | void;
}

const Question = ({ item, onEdit, onDelete }: Props) => {
	const t = useTranslations('flow.knowledge.create');
	const { exec: deleteItem, isLoading: isDeleteLoading } = useDeleteKnowledgeBaseQa();
	const params = useParams();

	// const knowledgeBases = item.knowledge_base.filter((i) => i.id !== params.id);
	// console.log(item.knowledge_base, params.id, knowledgeBases);
	const knowledgeBases = item.knowledge_base;

	return (
		<div key={item.id} className="card-gradient flex  flex-col gap-3 p-5">
			<div className="flex min-h-[80px] flex-col">
				<span>{t('questionLabel')}</span>
				<span className="text-foreground line-clamp-2 font-semibold">
					{item.question}
				</span>
			</div>
			<div className="flex flex-col">
				<span>{t('answerLabel')}</span>
				<span className="text-foreground line-clamp-3 font-semibold">{item.answer}</span>
			</div>
			<div className="mt-5 flex  flex-grow flex-row items-end justify-between">
				<CustomButton
					variant="outline"
					size="icon"
					className="h-9 w-9 rounded-full"
					loading={isDeleteLoading}
					onClick={() => {
						deleteItem(item.id).then(onDelete);
					}}>
					<Trash size={14} />
				</CustomButton>

				{knowledgeBases.length >= 2 && (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<div className="flex -space-x-4 rtl:space-x-reverse">
									{knowledgeBases.slice(0, 4).map((knowledgeBase, index) => (
										<div
											className="knowledgebase-gradient h-10 w-10 rounded-full"
											key={index}
											style={{
												backgroundColor: generateThumb(knowledgeBase.id)[0],
											}}></div>
									))}

									{knowledgeBases.length > 4 && (
										<div className="knowledgebase-gradient flex h-10 w-10 items-center justify-center  rounded-full bg-gray-700 text-xs font-semibold text-white">
											+{knowledgeBases.length - 4}
										</div>
									)}
								</div>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p>
									{t('questionInKnowledgeBases', {
										count: knowledgeBases.length,
									})}
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}

				<CustomButton size="icon" className="h-9 w-9 rounded-full" onClick={onEdit}>
					<Edit size={14} />
				</CustomButton>
			</div>
		</div>
	);
};

export default Question;
