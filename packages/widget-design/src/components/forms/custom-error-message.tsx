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
		<div className="wdg-absolute wdg-right-1 wdg-z-10 wdg-rounded-sm">
			<HoverCard defaultOpen>
				<HoverCardTrigger asChild>
					<div className="wdg-text-foreground/50 wdg-h-full wdg-cursor-pointer wdg-p-1">
						<AlertCircle size={16} />
					</div>
				</HoverCardTrigger>
				<HoverCardContent
					sideOffset={0}
					side="top"
					className="wdg-bg-foreground wdg-text-background wdg-w-auto wdg-rounded-sm wdg-border-none wdg-px-2 wdg-py-1 wdg-text-xs wdg-font-semibold">
					<Arrow className="wdg-fill-foreground" />
					{error?.message}
				</HoverCardContent>
			</HoverCard>
		</div>
	);
};
