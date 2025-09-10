import plugin from 'tailwindcss/plugin';
/** @type {import('tailwindcss').Config} */

const {
	default: flattenColorPalette,
} = require('tailwindcss/lib/util/flattenColorPalette');

module.exports = {
	content: ['./src/**/*.{html,ts}'],
	theme: {
		extend: {
			height: {
				custom: 'min(704px, calc(100% - 104px))', // Define your custom height
			},
			boxShadow: {
				custom: 'rgba(0, 0, 0, 0.16) 0px 5px 40px',
			},
		},
	},
	corePlugins: {
		preflight: false,
	},
	plugins: [
		plugin(function ({ addVariant }) {
			addVariant('mobile-only', "@media screen and (max-width: theme('screens.sm'))");
		}),
		plugin(function ({ matchUtilities, theme }) {
			matchUtilities(
				{
					highlight: (value: string) => ({ boxShadow: `inset 0 1px 0 0 ${value}` }),
				},
				{ values: flattenColorPalette(theme('backgroundColor')), type: 'color' },
			);
		}),
	],
};
