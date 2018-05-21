const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 生成打包分析图，用来观察性能
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
    resolve: {
        // 给出别名, 可以import别名， e.g. import 'MVVM', 而不是复杂的路径 e.g. import '../MVVM'
        alias: {
            MVVM: path.resolve(__dirname, 'src/Vendor/MVVM'),
        },
        // 可以在js文件中不用加扩展名，会尝试以下扩展名
        extensions: ['.js', '.css', '.json'],
    },
    mode: 'development',
    entry: {
        index: path.resolve(__dirname, 'src/index.js'),
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].entry.bundle.js',
        chunkFilename: '[name].chunk.bundle.js',
    },
    // 生成map文件, 如果有错误，会报出在源文件中的位置而不是生成的bundle文件的位置
    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            REQUEST_API: JSON.stringify('test'),
        }),
        new HtmlWebpackPlugin({
            title: 'myapp',
            template: path.resolve(__dirname, 'src/index.ejs'),
            // 如果有错误，显示在页面中
            showErrors: true,
        }),
        new BundleAnalyzerPlugin(),
    ],
    devServer: {
        historyApiFallback: true,
        hot: true,
        inline: true,
        port: 8081,
    },
    module: {
        // loader的加载顺序是从右往左，从下往上
        rules: [
            {
                // 一个用以匹配 loaders 所处理文件的拓展名的正则表达式（必须）
                test: /\.(js|jsx|mjs)$/,
                // include/exclude：手动添加必须处理的文件（文件夹）或屏蔽不需要处理的文件（文件夹）（可选）
                exclude: /node_modules/,
                loader: ['babel-loader?cacheDirectory=true'],
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                // 让css模块化，暴露出一个以类名为属性的对象，并且区分local class和global class
                loaders: [
                    'style-loader',
                    'css-loader?modules&localIdentName=[name]---[local]---[hash:base64:5]&camelCase',
                ],
            },
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                use: {
                    loader: 'url-loader',
                    options: {
                        // 如果小于这个值，会以base64为出现在css中 e.g. 1KB
                        limit: 1024,
                        name: '[name].[hash:8].[ext]', //  index.css 中background: url(test.b33efd67.jpg);
                    },
                },
            },
        ],
    },
    // webpack4取消了common chunk，转而使用自带配置optimization
    optimization: {
        runtimeChunk: {
            name: 'manifest',
        },
        splitChunks: {
            cacheGroups: {
                // 提取在入口chunk和异步载入的chunk中用到的所有node_modules下的第三方包，
                // 并且打包出的chunk名称为vendors
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                    minSize: 1,
                },
                // 提取被两个以上的入口chunk引用的模块为公共模块
                entries: {
                    test: /src/,
                    chunks: 'initial',
                    minSize: 0,
                    minChunks: 2,
                },
                // 提取被入口chunk或者异步载入的chunk所引用的总次数超过两次的模块为公共模块。
                // 注: 如果该模块在某入口chunk中引入了，又在该入口chunk的异步chunk中引入了，引用次数算作1次。
                all: {
                    test: /src/,
                    chunks: 'all',
                    minSize: 0,
                    minChunks: 2,
                },
                // 提取只被异步载入的chunk引用次数超过两次的模块为公共模块
                async: {
                    test: /src/,
                    chunks: 'async',
                    minSize: 0,
                    minChunks: 2,
                },
            },
        },
    },
};
