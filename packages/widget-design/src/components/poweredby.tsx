import logo from '@airtask/core/src/assets/images/logo.svg';
import { useTranslations } from 'next-intl';

interface Props {
	hidden?: boolean;
}

export const PoweredBy = ({ hidden }: Props) => {
	const t = useTranslations();

	return (
		<div
			className={`wdg-flex wdg-items-center wdg-justify-center wdg-gap-1.5 wdg-px-4  ${
				hidden ? 'wdg-opacity-0 wdg-py-0' : 'wdg-opacity-100 wdg-py-2'
			}`}>
			<p className="wdg-text-foreground/40 wdg-text-xs wdg-font-medium">
				{t('powered-by')}
			</p>
			<div className="wdg-flex wdg-items-center wdg-gap-1">
				<img src={logo.src} className="wdg-h-4 wdg-w-auto" alt="airtask" />
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://airtask.ai/?via=widget"
					className="wdg-text-foreground/60 wdg-text-sm wdg-font-semibold wdg-tracking-tight ">
					Airtask
				</a>
			</div>
		</div>
	);
};
