module.exports = {
	root: true,
	env: {
		browser: true,
		es2020: true,
		node: true,
		jest: true,
	},
	extends: ['next', 'prettier'],
	rules: {
		'@next/next/no-html-link-for-pages': 'off',
		'@typescript-eslint/no-unsafe-call': 'off',
		'@typescript-eslint/no-unsafe-assignment': 'off',
		'react/display-name': 'off',
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 11,
		sourceType: 'module',
	},
	settings: {
		next: {
			rootDir: ['apps/*/'],
		},
	},
};
