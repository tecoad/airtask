import { Head } from '@react-email/components';
import React from 'react';
import { ENV } from '../../utils/env';
import Font from './custom-font';

export const Fonts = () => {
	return (
		<Head>
			<Font
				fontFamily="CharlieDisplay"
				fallbackFontFamily="Helvetica"
				webFont={{
					url: `${ENV.baseUrl}/static/fonts/charlie-display/CharlieDisplay-Regular.woff2`,
					format: 'woff2',
				}}
				fontWeight={400}
				fontStyle="normal"
			/>
			<Font
				fontFamily="CharlieDisplay"
				fallbackFontFamily="Helvetica"
				webFont={{
					url: `${ENV.baseUrl}/static/fonts/charlie-display/CharlieDisplay-Bold.woff2`,
					format: 'woff2',
				}}
				fontWeight={700}
				fontStyle="normal"
			/>

			<Font
				fontFamily="CharlieText"
				fallbackFontFamily="Helvetica"
				webFont={{
					url: `${ENV.baseUrl}/static/fonts/charlie-text/CharlieText-Bold.woff2`,
					format: 'woff2',
				}}
				fontWeight={700}
				fontStyle="normal"
			/>
			<Font
				fontFamily="CharlieText"
				fallbackFontFamily="Helvetica"
				webFont={{
					url: `${ENV.baseUrl}/static/fonts/charlie-text/CharlieText-Regular.woff2`,
					format: 'woff2',
				}}
				fontWeight={400}
				fontStyle="normal"
			/>
		</Head>
	);
};

export default Fonts;
