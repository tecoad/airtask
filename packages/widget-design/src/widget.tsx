'use client';
import '@airtask/core/src/assets/fonts/charlie-text/stylesheet.css';
import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl';
import { useEffect, useState } from 'react';

import BottomFade from './components/bottom-fade';
import ColorInspector from './components/color-inspector';
import { Content, WidgetContentProps } from './components/content';
import { ErrorMessage } from './components/error-message';
import { Header, WidgetHeaderProps } from './components/header';
import { PoweredBy } from './components/poweredby';
import { Shortcuts } from './components/shortcuts';
import { Template } from './components/template';
import {
	UserIdentifier,
	UserIdentifierForm,
} from './components/user-identifier/user-identifier';
import { UserInput, UserInputProps } from './components/user-input';
import './globals.css';
import {
	getHslString,
	getMostContrastBlackOrWhite,
	getShadowColor,
} from './lib/color-utils';
import { ThemeProvider, ThemeType } from './lib/theme-provider';

export type Links = {
	title: string;
	href: string;
};

export type AvailableThemesType = 'light' | 'dark' | 'both';

export type WidgetProps = {
	mainColor?: string;
	position?: string;
	distanceFromBottom?: string;
	height?: string;
	hidePoweredBy?: boolean;
	// fontClassName?: string;
	googleFontName?: string;
	fontSize?: number;
	framed?: boolean;
	links?: Links[];
	activeTheme?: ThemeType;
	availableThemes?: AvailableThemesType;
	/**
	 * If this function is passed, the input will be replaced with user identifier
	 */
	onUserIdentified?: (input: UserIdentifierForm) => Promise<void> | void;

	/**
	 * Global loading
	 */
	isLoading?: boolean;
	/**
	 * When this value exists, the entire component will show an error message
	 */
	globalErrorMessage?: string;

	header: WidgetHeaderProps;
	content: WidgetContentProps;
	input: UserInputProps;

	i18n: {
		locale: ReturnType<typeof useLocale>;
		messages: ReturnType<typeof useMessages>;
	};
};

export const Widget = (props: WidgetProps) => {
	const {
		mainColor,
		hidePoweredBy,
		header,
		content,
		input,
		fontSize,
		framed,
		links,
		isLoading = false,
		globalErrorMessage = '',
		onUserIdentified,
		i18n,
		googleFontName,
		activeTheme,
		availableThemes,
	} = props;

	const [fontUrl, setFontUrl] = useState('');

	// useEffect to fetch font from Google Fonts API
	useEffect(() => {
		if (googleFontName) {
			setFontUrl(
				`https://fonts.googleapis.com/css2?family=${encodeURIComponent(
					googleFontName,
				)}&display=swap`,
			);
		}
	}, [googleFontName]);

	const [isCloseable, setIsCloseable] = useState(false); // default to false

	useEffect(() => {
		setIsCloseable(window.parent !== window);
	}, []);

	const [chatColor, setChatColor] = useState(getHslString(mainColor || '#3F5EEE'));

	const shadowColor = getShadowColor(chatColor);
	const mostContrastBlackOrWhite = getMostContrastBlackOrWhite(chatColor);

	const handleColorChange = (newColor) => {
		setChatColor(newColor);
	};

	return (
		<ThemeProvider defaultTheme={activeTheme || 'dark'}>
			<NextIntlClientProvider {...i18n}>
				<link href={fontUrl} rel="stylesheet" />

				<style
					dangerouslySetInnerHTML={{
						__html: `
          .atask-wdg{
						--chat-color: ${chatColor};
						--chat-colorGradientShadow: ${shadowColor};
						--chat-mostContrastBlackOrWhite: ${mostContrastBlackOrWhite};
						--chat-fontSize: ${fontSize ? fontSize + 'px' : '15px'};
						--input-fontSize: ${fontSize ? fontSize + 'px' : '16px'};
						--font-sans: ${googleFontName ? googleFontName : 'Charlie Text'};

            font-family: '${
							googleFontName ? googleFontName : 'Charlie Text'
						}', sans-serif !important;
          }
          `,
					}}
				/>

				<Template framed={framed}>
					{globalErrorMessage ? (
						<ErrorMessage globalErrorMessage={globalErrorMessage} />
					) : (
						<>
							<Header
								{...header}
								isLoading={isLoading}
								availableThemes={availableThemes}
								closeable={isCloseable}
							/>

							<Content {...content} isLoading={isLoading} mainColor={chatColor} />

							<BottomFade />

							{links && <Shortcuts links={links} />}

							{onUserIdentified ? (
								<UserIdentifier onSubmit={onUserIdentified} />
							) : (
								<UserInput {...input} />
							)}
						</>
					)}

					<ColorInspector chatColor={chatColor} onColorChange={handleColorChange} />

					<PoweredBy hidden={hidePoweredBy} />
				</Template>
			</NextIntlClientProvider>
		</ThemeProvider>
	);
};
