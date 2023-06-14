const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: './index.js',
    target: 'web',
    plugins: [
        new webpack.ProvidePlugin({
            'fetch': 'exports?self.fetch!whatwg-fetch'
        }),
    ],
    output: {
        library: 'historySync',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'build'),
        filename: 'historySync.js',
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            //'node-fetch': 'whatwg-fetch/fetch.js',
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
};
