import { User2 } from 'lucide-react';

interface Props {
	input: string;
	age: string;
}

export const UserPrompt = ({ input, age }: Props) => {
	return (
		<div className="wdg-prompt">
			<div className="wdg-avatar wdg-avatar-user">
				<User2 className="wdg-avatar-icon" />
			</div>
			<div className="wdg-bubble-wrapper">
				<div className="wdg-bubble wdg-bg-[--chat-color] wdg-text-[--chat-mostContrastBlackOrWhite]">
					<p className="wdg-bubble-text">{input}</p>
				</div>
				<span className="wdg-sent-time">{age}</span>
			</div>
		</div>
	);
};
