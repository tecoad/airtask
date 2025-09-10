import gql from 'graphql-tag';

export const WIDGET_CONFIG_FRAGMENT = gql`
	fragment WidgetConfig on WidgetConfig {
		title
		width
		position
		main_color
		initially_open
		allowed_domains
		hide_powered_by
		height
		google_font
		distance_from_border
		button_text_color
		button_text
		button_font_size
		button_color
		button_icon_color
		button_size
		font_size
		icon {
			id
			url
		}
		avatar {
			id
			url
		}
	}
`;

export const ASSET_FRAGMENT = gql`
	fragment Asset on Asset {
		id
		title
		url
		height
		width
		type
		filesize
		duration
	}
`;
