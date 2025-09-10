'use client';

import { LoadingAnimation } from '@airtask/animations';
import moment from 'moment';
import 'moment/locale/pt-br';
import { useLocale } from 'next-intl';
import { useReRender } from '../lib/use-re-render';
import { BotPrompt } from './bot-prompt';
import { UserPrompt } from './user-prompt';

interface MessageLinks {
	title: string;
	url: string;
}

export type WidgetContentProps = {
	messages: {
		role: 'bot' | 'user';
		content: string;
		sent_at: Date;
		message_links?: MessageLinks[];
	}[];
	isThinking?: boolean;
	avatarSrc?: string;
	chatIconSrc?: string;
	isRatingActive?: boolean;
};

type InternalContentProps = {
	isLoading?: boolean;
	mainColor: string;
};

export const Content = ({
	messages,
	isThinking,
	isLoading,
	isRatingActive,
	avatarSrc,
	mainColor,
}: WidgetContentProps & InternalContentProps) => {
	const locale = useLocale();

	const momentStr = (date: Date) => {
		return moment(date).locale(locale).fromNow();
	};

	// To update moment str each minute
	useReRender();

	return isLoading ? (
		<div className="wdg-relative wdg-flex wdg-flex-grow wdg-items-center wdg-overflow-y-auto wdg-p-4  wdg-justify-center">
			<LoadingAnimation width="55px" color={mainColor} />
		</div>
	) : (
		<div className="wdg-relative wdg-flex wdg-flex-1 wdg-flex-col-reverse  wdg-overflow-y-auto wdg-px-4 md:wdg-px-6 wdg-custom-scroll ">
			{isThinking && (
				<div className="wdg-pb-6 -wdg-mt-3">
					<BotPrompt response="Writting..." age="Now" avatar={avatarSrc} isLoading />
				</div>
			)}
			{messages.map((v, k) => (
				<div
					// Fix to normalize the first and last padding on safari
					className={`message wdg-py-2 ${
						k === 0 ? 'wdg-pb-6' : k === messages.length - 1 ? 'wdg-pt-6' : ''
					}`}
					key={k}>
					{v.role === 'bot' ? (
						<BotPrompt
							response={v.content}
							isRatingActive={isRatingActive}
							age={momentStr(v.sent_at)}
							message_links={v.message_links}
							// feedback="positive"
							avatar={avatarSrc}
						/>
					) : (
						<UserPrompt input={v.content} age={momentStr(v.sent_at)} />
					)}
				</div>
			))}
		</div>
	);
};
