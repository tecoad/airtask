import { ThumbsDown, ThumbsUp } from 'lucide-react';

interface Props {
	isRatingActive?: boolean;
	feedback?: 'positive' | 'negative';
}

const BotRating = ({ isRatingActive, feedback }: Props) => {
	return (
		isRatingActive && (
			<div className="wdg-absolute wdg-bottom-0 wdg-right-0 wdg-flex wdg-items-center wdg-gap-2">
				{feedback !== 'negative' && (
					<button
						type="submit"
						name="reaction"
						value="POSITIVE"
						className={`wdg-inline-flex wdg-items-center wdg-justify-center wdg-rounded-fullwdg- wdg-border-gray-200 wdg-bg-white wdg-p-1 wdg-text-gray-500 wdg-transition-all wdg-duration-150 hover:wdg-border-green-500 hover:wdg-bg-green-50 hover:wdg-text-green-700 border ${
							feedback === 'positive'
								? 'wdg-border-green-500 wdg-bg-green-50 wdg-text-green-700'
								: ''
						}`}>
						<ThumbsUp size={16} className="wdg-h-5 wdg-w-5 wdg-shrink-0" />
					</button>
				)}

				{feedback !== 'positive' && (
					<button
						type="submit"
						name="reaction"
						value="NEGATIVE"
						className={`wdg-inline-flex wdg-items-center wdg-justify-center wdg-rounded-full wdg-border wdg-border-gray-200 wdg-bg-white wdg-p-1 wdg-text-gray-500 wdg-transition-all wdg-duration-150 hover:wdg-border-red-500 hover:wdg-bg-red-50 hover:wdg-text-red-700 ${
							feedback === 'negative'
								? 'wdg-border-red-500 wdg-bg-red-50 wdg-text-red-700'
								: ''
						}`}>
						<ThumbsDown size={16} className="wdg-h-5 wdg-w-5 wdg-shrink-0" />
					</button>
				)}
			</div>
		)
	);
};

export default BotRating;
