const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: './index.js',
    target: 'web',
    output: {
        library: 'historySync',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'dist'),
        filename: 'historySync.js',
    },
    resolve: {
        extensions: ['.js']
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
