var webpack = require("webpack");
var webpackStats = require('stats-webpack-plugin');
var path = require('path');
module.exports = {
    entry: [
        "webpack/hot/dev-server",
        `webpack-hot-middleware/client?reload=true`,
        "./src/entry-js.js",
    ],
    output: {
        path: '/',
        publicPath: "/public",
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: "node_modules",
                loader: "babel",
                query: {
                    presets: ["es2015", "stage-0"]
                }
            },
            { test: /\.css$/, loader: "style-loader!css-loader!resolve-url" },
            { test: /\.scss$/, loader: "style-loader!css-loader!resolve-url!sass-loader?sourceMap" },
            { test: /\.less$/, loader: "style-loader!css-loader!resolve-url!less-loader" },
            {
                test: /\.(png|jpg|gif)$/,
                loader: "url-loader",
                query: {
                    limit: 100,
                    name: "/image/[name].[ext]"
                }
            }, {
                test: /\.(woff|woff2)$/,
                loader: "url-loader",
                query: {
                    limit: 10000,
                    mimetype: "application/font-woff",
                    name: "/fonts/[name].[ext]"
                }
            }, {
                test: /\.(ttf|eot)$/,
                loader: "file-loader?name=/fonts/[name].[ext]"
            }, {
                test: /\.(svg)$/,
                loader: "file-loader?name=/fonts/[name].[ext]"
            }
        ]
    },
    resolve: {
        root: process.cwd(),
        modulesDirectories: [
            'bower_components',
            'node_modules',
        ],
        extensions: [
            '',
            '.js',
            '.style'
        ]
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpackStats('webpack.json')
    ]
};