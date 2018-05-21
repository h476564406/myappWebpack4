const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'production',
    entry: './entry_server.js',
    // target: 'node' 指明构建出的代码是要运行在node环境里.
    // 不把 Node.js 内置的模块打包进输出文件中，例如 fs net 模块等
    target: 'node',
    // 不把 node_modules 目录下的第三方模块打包进输出文件中
    externals: [nodeExternals()],
    output: {
        // 指明输出的代码要是commonjs规范. 使暴露出的渲染函数能够被采用 Node.js 编写的 HTTP服务调用。
        libraryTarget: 'commonjs2',
        // 把最终可在 Node.js 中运行的代码输出到一个 bundle_server.js 文件
        filename: 'bundle_server.js',
        path: path.resolve(__dirname, './dist'),
        publicPath: '/',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['babel-loader'],
                exclude: path.resolve(__dirname, 'node_modules'),
            },
            {
                // 忽略掉 CSS 文件。 ignore-loader 防止不能在node里执行, 服务端渲染也用不上的文件被打包进去。
                test: /\.css/,
                use: ['ignore-loader'],
            },
        ],
    },
    devtool: 'source-map', // 输出 source-map 方便直接调试 ES6 源码
};
