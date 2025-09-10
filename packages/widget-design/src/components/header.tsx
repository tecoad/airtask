import { useTheme } from '@/lib/theme-provider';
import { AvailableThemesType } from '@/widget';
import { Moon, RotateCcw, Sun, X } from 'lucide-react';
export type WidgetHeaderProps = {
	title?: string;
	onRefresh?: () => void | Promise<void>;
	isRefreshLoading?: boolean;
	availableThemes?: AvailableThemesType;
	closeable?: boolean;
};

type InternalHeaderProps = {
	isLoading?: boolean;
};

export const Header = ({
	title = 'Chat',
	isLoading,
	onRefresh,
	isRefreshLoading,
	availableThemes,
	closeable,
}: WidgetHeaderProps & InternalHeaderProps) => {
	const { setThemeActive, themeActive } = useTheme();

	return (
		<div className="wdg-bg-background wdg-shrink-0 wdg-rounded-t-xl wdg-px-4 wdg-py-3 wdg-border-b">
			<div className="wdg-flex wdg-items-center wdg-justify-between wdg-gap-6">
				<div
					className={`wdg-min-w-0 wdg-flex-1 wdg-text-lg wdg-font-bold ${
						isLoading ? 'wdg-is-skeleton' : ''
					}`}>
					{title}
				</div>
				{onRefresh && !isRefreshLoading && (
					<div className="wdg-flex wdg-items-center wdg-justify-end wdg-gap-3">
						{availableThemes === 'both' && (
							<button
								className="wdg-header-button"
								onClick={() => setThemeActive(themeActive === 'dark' ? 'light' : 'dark')}>
								{themeActive === 'dark' ? (
									<Sun size={18} strokeWidth={2} />
								) : (
									<Moon size={18} strokeWidth={2} />
								)}
							</button>
						)}

						<button
							type="button"
							onClick={onRefresh}
							disabled={isRefreshLoading}
							aria-disabled={isRefreshLoading}
							className="wdg-header-button">
							<RotateCcw size={18} strokeWidth={2} />
						</button>

						{closeable && (
							<button
								type="button"
								onClick={() => {
									window.parent.postMessage({ type: 'atk-close-widget' }, '*');
								}}
								className="wdg-header-button">
								<X size={18} strokeWidth={2} />
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
