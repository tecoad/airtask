import { ENV } from '@/core/config/env';
import {
	AccountFragment,
	UpdateAccountSettingsInput,
	WidgetConfigFragment,
	WidgetConfigInput,
} from '@/core/shared/gql-api-schema';

export const quotationConfigToInput = (
	input?: WidgetConfigFragment,
): Required<WidgetConfigInput> => {
	return {
		title: input?.title!,
		button_color: input?.button_color!,
		button_font_size: input?.button_font_size!,
		button_icon_color: input?.button_icon_color!,
		button_size: input?.button_size!,
		button_text: input?.button_text!,
		button_text_color: input?.button_text_color!,
		distance_from_border: input?.distance_from_border!,
		font_size: input?.font_size!,
		google_font: input?.google_font!,
		height: input?.height!,
		hide_powered_by: input?.hide_powered_by!,
		initially_open: input?.initially_open!,
		main_color: input?.main_color!,
		position: input?.position!,
		width: input?.width!,
		avatar: input?.avatar?.id!,
		icon: input?.icon?.id!,
		allowed_domains: input?.allowed_domains || [],
		theme: input?.theme!,
	};
};

export const accountSettingsToInput = (
	input: AccountFragment,
): Required<UpdateAccountSettingsInput> => {
	return {
		id: input.id!,
		description: input.description!,
		name: input.name!,
		segment: input.segment?.id!,
		website: input.website!,
	};
};

export const fetchGoggleFontFamilyList = async () => {
	const fonts = await fetch(
		`https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&key=${ENV.GOOGLE.cloud_api_key}`,
		{
			next: {
				revalidate: 60 * 30,
			},
		},
	).then(
		(r) =>
			r.json() as Promise<{
				items: { family: string }[];
			}>,
	);

	return fonts.items.map((v) => v.family);
};
