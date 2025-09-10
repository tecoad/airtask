import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export type UserInputProps = {
	sendMessage: (input: string) => void | Promise<void>;
	isDisabled?: boolean;
	isHidden?: boolean;
	isWriting?: boolean;
};

export const UserInput = ({ sendMessage, isWriting, isHidden }: UserInputProps) => {
	const t = useTranslations();

	const [input, setInput] = useState('');
	const [isFocused, setIsFocused] = useState(false);
	const [hasValue, setHasValue] = useState(false);
	const [animationState, setAnimationState] = useState('initial');

	const onSubmit = () => {
		if (isWriting || !input.trim()) return;
		setInput('');
		setHasValue(false);
		setAnimationState('justSent');
		sendMessage(input);
	};

	const onValueChange = (e) => {
		setInput(e);
		if (e.trim() !== '') {
			setAnimationState('hasValue');
			setHasValue(true);
		} else {
			setHasValue(false);
			setAnimationState('initial');
		}
	};

	const variants = {
		initial: { x: 0, y: 0 },
		hasValue: { x: '100%', y: '-100%' },
		justSent: { x: '200%', y: '-200%' },
	};
	const transition = {
		type: 'spring',
		stiffness: 500, // Para controlar a rigidez da animação
		damping: 25, // Para controlar a suavidade da animação
		mass: 0.75, // Para controlar a massa do objeto (impacto na animação)
		delay: 0.2, // Atraso para criar efeito de antecipação
	};

	return isHidden ? (
		<></>
	) : (
		<div className="wdg-shrink-0 wdg-px-4 md:wdg-px-6">
			<div className="wdg-relative ">
				<label htmlFor="message" className="wdg-sr-only">
					{t('userInput.placeholder')}
				</label>

				<input
					id="message"
					name="message"
					placeholder={t('userInput.placeholder')}
					className="wdg-h-[46px] wdg-w-full wdg-bg-foreground/10 wdg-pl-4 wdg-pr-12  wdg-rounded-r-[23px] wdg-rounded-l-lg  wdg-text-foreground focus:wdg-outline-none wdg-ring-1 focus:wdg-ring-2 wdg-ring-foreground/20 focus:wdg-ring-[--chat-color] wdg-transition-all"
					aria-label={t('userInput.writeAMessage')}
					autoComplete="off"
					value={input}
					onChange={(e) => {
						onValueChange(e.target.value);
					}}
					onFocus={() => {
						setIsFocused(true);
					}}
					onBlur={() => {
						setIsFocused(false);
					}}
					onKeyDown={(e) => {
						if (e.key == 'Enter') {
							onSubmit();
						}
					}}
				/>

				<div className="wdg-absolute wdg-bottom-0 wdg-right-0 wdg-top-0 wdg-flex wdg-items-center wdg-h-full wdg-p-1">
					<button
						onClick={onSubmit}
						className={cn(
							'wdg-h-full wdg-aspect-square wdg-rounded-full wdg-button',
							hasValue && 'wdg-color-gradient wdg-background-animate',
						)}>
						<motion.div
							variants={variants}
							transition={transition}
							animate={animationState}
							className="wdg-w-full wdg-h-full wdg-absolute">
							<div className="wdg-icon-wrapper">
								<MessageCircle size={22} strokeWidth={2} />
							</div>

							<div className="wdg-icon-wrapper -wdg-left-[100%] -wdg-bottom-[100%]">
								<Send size={22} strokeWidth={2} />
							</div>

							<div className="wdg-icon-wrapper -wdg-left-[200%] -wdg-bottom-[200%]">
								<MessageCircle size={22} strokeWidth={2} />
							</div>
						</motion.div>
					</button>
				</div>
			</div>
		</div>
	);
};
