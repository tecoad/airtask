import { Bot } from 'lucide-react';

import BotLinks from './bot-links';
import BotRating from './bot-rating';
import { BotThinking } from './bot-thinking';

interface Props {
	response: string;
	age: string;
	feedback?: 'positive' | 'negative';
	message_links?: {
		title: string;
		url: string;
	}[];
	isLoading?: boolean;
	isRatingActive?: boolean;
	avatar?: string;
}

export const BotPrompt = ({
	response,
	age,
	feedback,
	isRatingActive,
	message_links,
	isLoading,
	avatar,
}: Props) => {
	return (
		<div className="wdg-prompt">
			<div className="wdg-avatar wdg-avatar-bot">
				{avatar ? <img src={avatar} /> : <Bot className="wdg-avatar-icon" />}
			</div>

			{isLoading ? (
				<BotThinking />
			) : (
				<div className="wdg-bubble-wrapper">
					<BotRating feedback={feedback} />

					<div className="wdg-bubble wdg-text-foreground/70 wdg-bg-gradient-to-br wdg-from-foreground/5 wdg-to-foreground/10">
						<p className="wdg-bubble-text">{response}</p>
					</div>

					<BotLinks message_links={message_links} />

					<span className="wdg-sent-time">{age}</span>
				</div>
			)}
		</div>
	);
};
