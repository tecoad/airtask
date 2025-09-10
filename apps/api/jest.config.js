/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
	moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
	rootDir: '.',
	testEnvironment: 'node',
	transform: {
		'^.+\\.(t|j)s$': 'ts-jest',
	},
	setupFilesAfterEnv: ['./test/config/global-setup.ts'],
	moduleDirectories: ['<rootDir>/', 'node_modules'],
};
