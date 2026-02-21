module.exports = function (api) {
	api.cache(true)
	return {
		presets: ['babel-preset-expo'],
		plugins: [
			[
				'module-resolver',
				{
					root: ['./src'],
					extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
					alias: {
						'@': './src',
						'@/assets': './assets',
					},
				},
			],
			'nativewind/babel',
			'@babel/plugin-transform-async-generator-functions',
			'react-native-reanimated/plugin', // Must be absolutely last
		],
		env: {
			production: {
				plugins: ['react-native-paper/babel'],
			},
		},
	}
}
