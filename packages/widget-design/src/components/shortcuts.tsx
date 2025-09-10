import { Links } from '../widget';

interface Props {
	links: Links[];
}

export const Shortcuts = ({ links }: Props) => {
	return (
		<div className="wdg-flex wdg-shrink-0 wdg-flex-wrap wdg-gap-2 wdg-px-4 wdg-pt-4">
			{links.map((link, k) => (
				<button
					key={k}
					type="button"
					className="wdg-inline-flex wdg-items-center wdg-rounded-full wdg-border wdg-border-[--chat-color] wdg-bg-white wdg-px-2 wdg-py-0.5 wdg-text-[length:--chat-fontSize] wdg-font-medium wdg-text-[--chat-color] wdg-transition-all wdg-duration-150 hover:wdg-bg-[--chat-color] hover:wdg-text-white">
					{link.title}
				</button>
			))}
		</div>
	);
};
