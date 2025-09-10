import { Check } from 'lucide-react';

export interface Step {
	title: string;
	description?: string;
	icon?: React.ReactNode;
	completed?: boolean;
	actionContent?: React.ReactNode;
}

interface Steps {
	steps: Step[];
}

export const Stepper = ({ steps }: Steps) => {
	return (
		<div className="border-foreground/20 relative border-l  pb-10">
			{steps.map((step, index) => (
				<div key={index} className="mb-10 ml-6  last:mb-0 md:ml-8">
					<div
						className={`md:l-8 absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-slate-400/10 md:-left-4 md:h-8 md:h-8 md:w-8 ${
							step.completed
								? 'highlight-white/30 bg-sky-400 text-white'
								: 'bg-slate-300 dark:bg-slate-600 dark:text-slate-300'
						}`}>
						{!step.completed ? step.icon : <Check size={16} strokeWidth={2.5} />}
					</div>
					<div className="flex flex-col gap-4 md:flex-row">
						<div>
							<div className="text-foreground font-semibold leading-tight">
								{step.title}
							</div>
							<p className="text-foreground/50 text-sm">{step.description}</p>
						</div>
						{step.actionContent}
					</div>
				</div>
			))}
		</div>
	);
};
