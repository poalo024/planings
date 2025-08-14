const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
mode: isDevelopment ? 'development' : 'production',
entry: path.resolve(__dirname, './src/index.js'),
devtool: 'inline-source-map',
devServer: {
static: path.resolve(__dirname, './public'),
hot: true,
port: 3000,
historyApiFallback: true,
},
module: {
rules: [
    {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: {
        loader: 'babel-loader',
        options: {
        presets: ['@babel/preset-env', '@babel/preset-react'],
        plugins: [isDevelopment && 'react-refresh/babel'].filter(Boolean),
        },
    },
    },
    {
    test: /\.css$/,
    use: ['style-loader', 'css-loader', 'postcss-loader'],
    },
],
},
plugins: [
new HtmlWebpackPlugin({
    template: path.resolve(__dirname, './public/index.html'),
}),
isDevelopment && new ReactRefreshWebpackPlugin(),
].filter(Boolean),
resolve: {
extensions: ['.js', '.jsx'],
},
output: {
filename: 'bundle.js',
path: path.resolve(__dirname, 'dist'),
publicPath: '/',
},
};