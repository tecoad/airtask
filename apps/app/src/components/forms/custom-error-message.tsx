import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Arrow } from '@radix-ui/react-hover-card';
import { AlertCircle } from 'lucide-react';
import { useFormField } from '../ui/form';

export const CustomError = () => {
	const { error } = useFormField();

	if (!error) return null;

	return (
		<div className="absolute right-1 z-10 rounded-sm">
			<HoverCard defaultOpen>
				<HoverCardTrigger asChild>
					<div className="text-foreground/50 h-full cursor-pointer p-1">
						<AlertCircle size={16} />
					</div>
				</HoverCardTrigger>
				<HoverCardContent
					sideOffset={0}
					side="top"
					className="bg-foreground text-background w-auto rounded-sm border-none px-2 py-1 text-xs font-semibold">
					<Arrow className="fill-foreground" />
					{error?.message}
				</HoverCardContent>
			</HoverCard>
		</div>
	);
};
