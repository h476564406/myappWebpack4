const fs = require('fs');

function FileListPlugin() {
    // 使用配置（options）设置插件实例
}

FileListPlugin.prototype.apply = compiler => {
    compiler.plugin('emit', (compilation, callback) => {
        // console.log(compiler.hooks);
        // console.log('compilation', compilation);
        // console.log('compilation', compilation.chunks);
        const stats = compilation.getStats().toJson();
        fs.writeFile('./compilationStats.json', JSON.stringify(stats));
        const allFiles = stats.assets.map(asset => asset.name);
        const entryFiles = Object.keys(stats.entrypoints)
            .map(entryName => stats.entrypoints[entryName].assets)
            .reduce(
                (accumulater, currentValue) => currentValue.concat(accumulater),
                [],
            );
        const asyncFiles = allFiles.filter(
            file => entryFiles.indexOf(file) < 0,
        );
        const entryJs = [];
        const entryCss = [];
        entryFiles.forEach(fileName => {
            const fileType = fileName.substring(fileName.lastIndexOf('.'));
            if (fileType === '.js') {
                entryJs.push(fileName);
            } else if (fileType === '.css') {
                entryCss.push(fileName);
            }
        });
        const clientFileList = JSON.stringify({
            entryJs,
            entryCss,
            asyncFiles,
            publicPath: stats.publicPath,
        });
        // console.log(compilation.assets['index.html'].source());
        // 把它作为一个新的文件资源插入到 webpack 构建中：
        compilation.assets['clientFileList.json'] = {
            source() {
                return clientFileList;
            },
            size() {
                return clientFileList.length;
            },
        };
        callback();
    });
};

module.exports = FileListPlugin;
