import { ENV } from '@/core/config/env';

import { PUBLIC_QUOTATION_WITHOUT_AVAILABILITY } from '@/containers/widget/api-gql';
import {
	PublicQuotationQuery,
	PublicQuotationQueryVariables,
} from '@/core/shared/api-gql-schema';
import {
	getMostContrastBlackOrWhite,
	getShadowColor,
} from '@airtask/widget-design/dist/lib/color-utils';
import { readFileSync } from 'fs';
import { print } from 'graphql';
import { NextRequest } from 'next/server';
import path from 'path';
import { quotationScriptTag } from './revalidate/helpers';

export const runtime = 'nodejs';

export async function GET(
	_request: NextRequest,
	{
		params,
	}: {
		params: {
			hash: string;
		};
	},
) {
	const response = await fetch(ENV.API.graphql_url!, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: print(PUBLIC_QUOTATION_WITHOUT_AVAILABILITY),
			variables: {
				hash: params.hash,
			} as PublicQuotationQueryVariables,
		}),
		next: {
			tags: [quotationScriptTag(params.hash)],
		},
	});

	const res = (await response.json()) as {
		data: PublicQuotationQuery;
	};
	const data = res.data.findPublicWithoutAvailabilityCheck;

	if (!data) {
		return new Response('Quotation not found', {
			status: 404,
		});
	}

	const scriptPath = path.join(
		process.cwd(),
		'../',
		'../',
		'packages',
		'widget-script',
		'dist',
	);

	const defaultScript = readFileSync(path.join(scriptPath, 'index.js'), 'utf8');
	const scriptCss = readFileSync(path.join(scriptPath, 'styles.css'), 'utf8');

	const backgroundColor = data.widget_config?.button_color || '#3F5EEE';
	const textColor =
		data.widget_config?.button_text_color || getMostContrastBlackOrWhite(backgroundColor);

	let css = scriptCss
		.replaceAll('{{BG}}', backgroundColor)
		.replaceAll('{{TEXT_COLOR}}', textColor)
		.replaceAll('{{GRADIENT_COLOR}}', getShadowColor(backgroundColor))
		.replaceAll('{{FONT_SIZE}}', data.widget_config?.button_font_size?.toString() || '16')
		.replaceAll('{{FONT_FAMILY}}', data.widget_config?.google_font || 'Charlie Display')
		.replaceAll('{{ICON_COLOR}}', data.widget_config?.button_icon_color || textColor)
		.replaceAll(
			'{{ICON_URL}}',
			data.widget_config?.icon?.url || `${ENV.WIDGET.assets_url}/images/logo.svg`,
		)
		.replaceAll('{{ICON_CLOSE_URL}}', `${ENV.WIDGET.assets_url}/images/close.svg`);

	let string = defaultScript
		.replaceAll('{{URL}}', `${ENV.baseUrl}/quotation/${data.hash}`)
		.replaceAll('{{POSITION}}', data.widget_config?.position || 'bottom-right')
		.replaceAll(
			'{{FONT_URL}}',
			data.widget_config?.google_font
				? `https://fonts.googleapis.com/css2?family=${data.widget_config.google_font
						.trim()
						.replace(/ /g, '+')}&display=block`
				: `${ENV.WIDGET.assets_url}/fonts/charlie-display/stylesheet.css`,
		)

		// this one we need to remove the string quotes
		.replaceAll(`"{{WIDGET_CONFIG}}"`, JSON.stringify(data.widget_config))
		.replaceAll(`{{CSS_STYLES}}`, css);

	return new Response(string, {
		headers: {
			'content-type': 'application/javascript; charset=utf-8',
		},
	});
}
