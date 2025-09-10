const typescript = require('rollup-plugin-typescript2');
const { terser } = require('rollup-plugin-terser');

const path = require('path');

module.exports = {
	input: ['src/index.ts'],
	output: {
		file: path.resolve(__dirname, 'dist', 'index.js'),
		format: 'cjs',
	},
	plugins: [typescript({}), terser()],
};
