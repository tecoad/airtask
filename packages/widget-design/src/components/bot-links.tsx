interface Props {
	message_links?: {
		title: string;
		url: string;
	}[];
}

const BotLinks = ({ message_links }: Props) => {
	return (
		<>
			{message_links && (
				<details className="wdg-mt-3">
					<summary className="wdg-cursor-pointer wdg-text-sm wdg-font-semibold wdg-text-gray-500 open:wdg-text-gray-900">
						Learn more
					</summary>

					<div className="wdg-mt-1">
						<div className="wdg-mt-2 wdg-flex wdg-flex-wrap wdg-gap-1.5">
							{message_links.map((link, k) => (
								<a
									href={link.url}
									key={k}
									className="wdg-truncate wdg-rounded-lg wdg-border wdg-border-gray-200 wdg-bg-white wdg-px-2 wdg-py-1 wdg-text-xs wdg-font-semibold wdg-text-gray-500 wdg-transition-all wdg-duration-150 after:-wdg-ml-0.5 after:wdg-text-gray-500 hover:wdg-border-gray-900 hover:wdg-bg-gray-100 hover:wdg-text-gray-900"
									target="_blank"
									rel="noreferrer">
									{link.title}
								</a>
							))}
						</div>
					</div>
				</details>
			)}
		</>
	);
};

export default BotLinks;
