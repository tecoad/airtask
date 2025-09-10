import { HelpCircle } from 'lucide-react';

export interface Question {
	question: string;
	answer?: string;
	icon?: React.ReactNode;
}

interface Questions {
	questions?: Question[] | null;
	skeletonMode?: boolean;
}

export const QuestionsTree = ({ questions, skeletonMode }: Questions) => {
	const fakeDataSkeleton: Question[] = skeletonMode
		? [
				{
					question: 'Qual tipo de design você deseja?',
					answer: 'Desejo uma logomarca!',
				},
		  ]
		: [];

	return (
		<div className="border-foreground/10 relative border-l pb-10">
			{(questions || fakeDataSkeleton).map((question, index) => (
				<div key={index} className="mb-10 ml-8 last:mb-0">
					<div
						className={`highlight-white/30 absolute -left-4 flex h-8 w-8 items-center justify-center  rounded-full bg-blue-500 bg-gradient-to-bl  from-transparent to-white/30 text-white ${
							skeletonMode ? 'bg-gray-400' : 'bg-blue-500'
						}`}>
						{question.icon ? (
							question.icon
						) : (
							<HelpCircle
								className={`${skeletonMode && 'animate-pulse'}`}
								size={20}
								strokeWidth={2}
							/>
						)}
					</div>
					<div className="flex flex-col  items-start gap-1">
						<div
							className={`text-foreground/50 text-sm ${skeletonMode && 'is-skeleton'}`}>
							{question.question}
						</div>
						<div
							className={`text-foreground font-semibold leading-tight ${
								skeletonMode && 'is-skeleton'
							}`}>
							{question.answer}
						</div>
					</div>
				</div>
			))}
		</div>
	);
};
