var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require("path")


module.exports = {
    entry: [
        "./src/entry-js.js",
    ],
    devtool: 'source-map',
    output: {
        path: path.join(__dirname, "/public"),
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
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!resolve-url!sass-loader?sourceMap")
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!resolve-url?sourceMap")
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!resolve-url!less-loader")
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: "url-loader",
                query: {
                    limit: 100,
                    name: "/image/[name].[ext]"
                }
            },
            {
                test: /\.(woff|woff2)$/,
                loader: "url-loader",
                query: {
                    limit: 10000,
                    mimetype: "application/font-woff",
                    name: "/fonts/[name].[ext]"
                }
            },
            {
                test: /\.(ttf|eot)$/,
                loader: "file-loader?name=/fonts/[name].[ext]"
            },
            {
                test: /\.(svg)$/,
                loader: "file-loader?name=/fonts/[name].[ext]"
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("/css/bundle.css", {
            disable: false,
            allChunks: true
        }),
    ]
};