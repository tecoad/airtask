import { CustomButton } from '@/components/custom-button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Step, Stepper } from './stepper';

type Props = {
	steps: Step[];
	module: string;
	progress: number;
	skeletonMode?: boolean;
};

export const Steps = ({ module, progress, skeletonMode, steps }: Props) => {
	const [showSteps, setShowSteps] = useState(false);

	const t = useTranslations('dashboard.onboardingSteps');

	return (
		<Card className={`${skeletonMode && 'animate-pulse'} overflow-hidden`}>
			<div className="flex flex-col gap-6 rounded-t-lg  p-4 md:p-6 ">
				<div className="flex flex-row items-center">
					<div className="font-semibold text-slate-900 dark:text-slate-200">
						{skeletonMode ? (
							<div className="bg-foreground/10 h-4 w-28 rounded-full" />
						) : (
							module
						)}
					</div>
					{skeletonMode ? (
						<div className="bg-foreground/10 ml-4 h-6 w-20 rounded-full" />
					) : (
						<div className="bg-foreground/80 text-background/90 highlight-white/20 ml-4 rounded-full px-2 py-1 text-xs font-semibold">
							{t('percentProgress', { percent: progress })}
						</div>
					)}
				</div>
				<Progress
					value={skeletonMode ? 0 : progress}
					className="h-[5px] bg-slate-500/20"
				/>
			</div>

			<div className="bg-foreground/5">
				<AnimatePresence>
					{showSteps && (
						<motion.div
							className="flex flex-col items-center overflow-hidden "
							initial={{ height: '0', opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: '0', opacity: 0 }}>
							<div className="pb-0 pl-10 pr-4 pt-4 ">
								<Stepper steps={steps} />
							</div>
						</motion.div>
					)}
				</AnimatePresence>
				<CustomButton
					onClick={skeletonMode ? undefined : () => setShowSteps(!showSteps)}
					className="w-full rounded-t-none"
					size="lg"
					variant="secondary">
					{skeletonMode ? (
						<>
							<div className="bg-foreground/10 h-4 w-20 rounded-full" />
							<div className="bg-foreground/10 ml-4 h-4 w-4 rounded-full" />
						</>
					) : (
						<>
							<div>{showSteps ? t('hideSteps') : t('showSteps')}</div>

							<ChevronDown
								size={18}
								strokeWidth={1.8}
								className={`ml-4 transition-transform ${showSteps ? 'rotate-180' : ''}`}
							/>
						</>
					)}
				</CustomButton>
			</div>
		</Card>
	);
};
