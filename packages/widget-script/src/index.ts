import { WidgetConfigFragment } from './gql-schema';

// This file should take care only of the structure of the widget mounting on the window
// If you wish to add any style, you should do on styles.css
(async function (window) {
	const ENV = {
		config: '{{WIDGET_CONFIG}}' as any as WidgetConfigFragment,
		url: '{{URL}}',
		font_url: '{{FONT_URL}}',
		position: '{{POSITION}}',
		styles: '{{CSS_STYLES}}',
	};

	const config: Partial<WidgetConfigFragment> = ENV.config;

	// Font
	if (config?.button_text) {
		const fontLink = document.createElement('link');
		fontLink.href = ENV.font_url;
		fontLink.rel = 'stylesheet';
		document.head.appendChild(fontLink);
	}

	// Create the style tag
	const style = document.createElement('style');
	style.innerHTML = ENV.styles;
	document.body.appendChild(style);

	// Main
	const app = document.createElement('div');
	app.classList.add('atk-app');
	document.body.appendChild(app);

	// Iframe Wrapper
	const iframeWrapper = document.createElement('div');
	iframeWrapper.classList.add('atk-iframe-wrapper', ENV.position);
	app.appendChild(iframeWrapper);

	// Iframe
	const iframe = document.createElement('iframe');
	iframe.src = ENV.url;
	iframe.classList.add('atk-iframe');
	iframeWrapper.appendChild(iframe);

	// Button
	const button = document.createElement('button');
	button.classList.add('atk-button', ENV.position);

	if (config?.button_text) {
		button.classList.add('with-text');
	}
	document.body.appendChild(button);

	// Icon
	const icon = document.createElement('div');
	icon.classList.add('atk-icon');
	button.appendChild(icon);

	// openIcon
	const openIcon = document.createElement('div');
	openIcon.classList.add('atk-open-icon');
	icon.appendChild(openIcon);

	// closeIcon
	const closeIcon = document.createElement('div');
	closeIcon.classList.add('atk-close-icon');
	icon.appendChild(closeIcon);

	// Text
	if (config?.button_text) {
		const text = document.createElement('div');
		text.textContent = config?.button_text;
		button.appendChild(text);
	}

	// These are the elements which we control the open/close state
	const elements = [iframeWrapper, icon, button];

	// Control if iframe is loaded to show button
	new Promise((res) => {
		iframe.addEventListener('load', () => res(true));
	}).then(() => {
		if (config?.initially_open) {
			elements.forEach((el) => el.classList.add('open'));
		}
		button.classList.add('loaded');
	});

	// Button Handler
	button.addEventListener('click', function () {
		elements.forEach((el) => el.classList.toggle('open'));
	});

	// Handle close from inside iframe
	window.addEventListener('message', function (event) {
		if (event.data.type === 'atk-close-widget') {
			elements.forEach((elem) => elem.classList.remove('open'));
		}
	});
})(window);
