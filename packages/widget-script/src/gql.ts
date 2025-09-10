function gql(...literals: any) {
	return literals.join('');
}

export const WIDGET_CONFIG_FRAGMENT = gql`
	fragment WidgetConfig on WidgetConfig {
		width
		position
		main_color
		initially_open
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

export const QUOTATION_WIDGET_SETTINGS = gql`
	query QuotationWidgetSettings($hash: String!) {
		quotationWidgetSettings(hash: $hash) {
			...WidgetConfig
		}
	}
	${WIDGET_CONFIG_FRAGMENT}
`;
