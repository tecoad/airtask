import { useTheme } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';

interface Props {
	// fontClassName?: string;
	framed?: boolean;
	children: React.ReactNode;
}

export const Template = ({ children, framed }: Props) => {
	const { themeActive } = useTheme();

	return (
		<div
			className={cn(
				'atask-wdg',
				themeActive === 'dark' ? 'wdg-dark' : 'wdg-light',
				`wdg-relative wdg-flex wdg-h-full wdg-flex-1 wdg-flex-col wdg-overflow-hidden wdg-from-foreground/5 wdg-via-foreground/10 wdg-to-background wdg-bg-gradient-to-br wdg-from-30% wdg-via-70% wdg-to-100%`,
			)}>
			{framed ? (
				<div className="wdg-absolute wdg-inset-0 sm:wdg-bottom-20 sm:wdg-left-auto sm:wdg-right-4 sm:wdg-top-auto">
					<div className="wdg-bg-background wdg-flex wdg-h-screen wdg-max-h-full wdg-w-full wdg-min-w-[calc(min(28rem,100vw))] wdg-flex-1 wdg-overflow-hidden sm:wdg-h-[80dvh] sm:wdg-max-w-md sm:wdg-rounded-lg">
						<div className="wdg-flex wdg-min-h-0 wdg-w-full wdg-flex-1 wdg-flex-col">
							{children}
						</div>
					</div>
				</div>
			) : (
				<div className="wdg-bg-background wdg-flex wdg-h-screen wdg-max-h-full wdg-w-full wdg-flex-1 wdg-overflow-hidden">
					<div className="wdg-flex wdg-min-h-0 wdg-w-full wdg-flex-1 wdg-flex-col">
						{children}
					</div>
				</div>
			)}
		</div>
	);
};
