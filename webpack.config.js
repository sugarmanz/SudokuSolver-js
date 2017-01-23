let HTMLWebpackPlugin = require('html-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin')

let htmlPlugin = new HTMLWebpackPlugin({
	template: './src/index.html'
});
let extractCSS = new ExtractTextPlugin('./src/css/[name].css');

module.exports = {
	entry: './src/js/sudoku.js',
	output: {
		filename: './dist/js/bundle.js'
	},
	devServer: {
		inline: true
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['stage-0', 'es2015', 'react']
				}
			},
			{
				test: /\.css$/,
				loader: extractCSS.extract([
					'css'
				])
			}
		]
	},
	resolve: {
		extensions: ['', '.js', '.jsx', '.css']
	},
	plugins: [
		htmlPlugin,
		extractCSS
	]
};