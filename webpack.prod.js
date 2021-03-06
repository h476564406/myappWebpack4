const webpack = require('webpack');
const Visualizer = require('webpack-visualizer-plugin');
const FileListPlugin = require('./FileListPlugin.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    resolve: {
        // 给出别名, 可以import别名， e.g. import 'MVVM', 而不是复杂的路径 e.g. import '../MVVM'
        alias: {
            MVVM: path.resolve(__dirname, 'src/Vendor/MVVM'),
        },
        // 可以在js文件中不用加扩展名，会尝试以下扩展名
        extensions: ['.js', '.css', '.json'],
    },
    mode: 'production',
    entry: {
        index: path.resolve(__dirname, 'src/index.js'),
    },
    plugins: [
        // 自定义插件，用来在服务端返回的html中注入js和css
        new FileListPlugin(),
        // 分析工具, 分析生成的文件的大小
        new Visualizer({
            filename: './statistics.html',
        }),
        // 定义js文件中可用的全局常量的值。
        // 如果不采用JSON.stringify, 直接赋值字符串，该字符串会被当作一个代码片段来使用, 报未定义的错误
        // Uncaught ReferenceError: official is not define
        new webpack.DefinePlugin({
            REQUEST_API: JSON.stringify('official'),
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
        // 每次webpack重新生成index.html文件, 会自动生成在output path下面
        // 多页面应用时配置多个html的做法  https://www.cnblogs.com/wonyun/p/6030090.html
        new HtmlWebpackPlugin({
            title: 'myapp',
            template: path.resolve(__dirname, 'src/index.ejs'),
            // 选择在html中所要引入的chunks, 如果不选择，则全部引入
            // chunks: ['index'],
            // 是否默认在body的闭合标签前注入js, 在head头注入css
            inject: true,
            // 是否为所有注入的静态资源添加webpack每次编译产生的唯一hash值,
            hash: false,
        }),
        // 在每次构建前移除整个dist文件，再重新build生成dist目录
        new CleanWebpackPlugin(['dist']),
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        // 将hash替换为chunkhash, hash 是 build-specific ，即每次编译都不同——适用于开发阶段。
        // chunkhash，即文件内容变化，则文件名变化。这样自动利用浏览器缓存且不会妨碍文件更新。
        filename: '[name].[chunkhash].entry.bundle.js',
        chunkFilename: '[name].[chunkhash].chunk.bundle.js',
        // html文件中的引用路径
        publicPath: '/dist/',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|mjs)$/,
                exclude: /node_modules/,
                loader: ['babel-loader', 'eslint-loader'],
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 1024,
                        name: '[name].[hash:8].[ext]', //  index.css 中background: url(test.b33efd67.jpg);
                    },
                },
            },
        ],
    },
    optimization: {
        minimize: true,
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
                    chunks: 'initial',
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
