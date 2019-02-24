
 [myapp的启动](https://github.com/h476564406/myappWebpack4#myapp%E7%9A%84%E5%90%AF%E5%8A%A8)

 [myapp实现了什么](https://github.com/h476564406/myappWebpack4#myapp%E5%AE%9E%E7%8E%B0%E4%BA%86%E4%BB%80%E4%B9%88)

 [myapp存在的问题](https://github.com/h476564406/myappWebpack4#myapp%E5%AD%98%E5%9C%A8%E7%9A%84%E9%97%AE%E9%A2%98)


# myapp的启动
如果要查看同构效果

* 拉取该分支到本地， npm install
* npm run build, 生成服务端和浏览端需要的文件
* node server.js, 访问http://localhost:3001

如果想单纯的进行浏览器端的调试

* 拉取该分支到本地， npm install
* npm start

# myapp实现了什么

 一. vue指令
 
 二. 浏览器路由
 
 三. 服务端和浏览器的同构 
 
 四. 自定义webpack插件FileListPlugin
 
## 一. 指令

对于设好的data数据，利用Object.defineProperty中的get,set方法结合观察者模式, 对data里的每一级属性收集依赖（观察者）， 直到这级属性的值为基本类型的数据。

* 设置get方法，在get方法中遍历data的当前属性， 和当前存在的watcher实例（Dep.target）绑定。这个watcher实例会在分析template模版中的指令时对应产生, 一个指令对应一个新的watcher实例，并且在Watcher构造函数中会对expOrFn求值，从而触发get方法，实现相关的所有层级的属性与当前watcher实例的绑定， 绑定完毕， 再popTarget()。

* 设置set方法，如果数据变化，通知该dep中保存的所有watcher实例，遍历调用watcher实例的update方法，update中会先对expOrFn求值，再调用update callback, 从而实现对dom的相关操作。

* 观察者模式，Dep实例和Watcher实例互相保留引用

* 何时新建watcher实例，触发属性中的get方法？

在分析模版指令的时候，碰到一个指令，新建一个watcher实例，并且把与这个指令对应的update函数（内含修改dom的操作）， 传入到该watcher中保存起来。

CompileUtil.js

```
text(node, vm, property) {
    this.bindWatcherAndCallback(node, vm, property, 'text');
},

bindWatcherAndCallback(node, vm, property, directive, nodeHtml = null) {
	 const updaterFn = updater[`${directive}Updater`];
    // 第一次渲染 view, 此时Dep.readyWatcher还不存在, 被触发的getter函数只是得到值，并没有绑定watcher
   updaterFn && updaterFn(this._getVMVal(vm, property));
    // 创建readyWatcher, 在初始化Wather的过程中连接watcher和deps。传入update函数， 对某个属性进行set操作时触发。
    new Watcher(vm, property, value => {
        updaterFn && updaterFn(value);
    });
}
```

在模版中，
如果一个属性和多个指令有关，一个属性会对应多个watcher。
如果一个指令中的属性层级很深，一个watcher会对应多个dep.


## 二. 浏览器路由
* Hash Router
监听load事件和hashchange事件,  分析window.location.hash， 引入对应path的component文件。

	HashRouter.js
	
	```
	window.addEventListener('load', () => {
	    this._urlChange();
	});
	window.addEventListener('hashchange', () => {
	    this._urlChange();
	});
	```
* History Router
history api没有提供像hashchange那样直接监听地址栏变化的的事件， 提供了popstate————监听历史记录条目更改的事件（当用户点击前进后退按钮时会触发事件监听函数）。代码中要根据用户不同的行为，对window.history操作， 从而改变地址栏的显示，引入对应path的component文件。
	
	HistoryRouter.js
	
	a. 如果用户行为是地址栏访问, 通过window.location.href拿到url。
	
	```
	window.addEventListener('load', () => {
	    const herf = window.location.href;
	    const path = herf.slice(herf.indexOf('/', 8));
	    self._urlChange(path, 0);
	});
	
	```
	b. 如果用户行为是点击a链接。代码中对所有的link标签进行绑定事件。通过e.target.getAttribute('href')拿到url。
	
	```
	document.body.addEventListener('click', e => {
	    if (e.target.nodeName === 'A') {
	        e.preventDefault();
	        self._urlChange(e.target.getAttribute('href'), 1);
	    }
	});
	```
	
	c. 如果用户是点击前进后退按钮， 通过window.history.state.path拿到url。
	
	```
	 window.addEventListener(
	    'popstate',
	    () => {
	        if (window.history.state !== null) {
	            self._urlChange(window.history.state.path, 2);
	        }
	    },
	    false,
	);
	```
	对window.history操作。
	
	```
	_urlChange(path, type) {
		 // type=1, 用户点击了a链接 
		 if (type === 1) {
		     window.history.pushState({ path, custom: 'hello' }, '', path);
		    // ...
		} else if (type === 2) {
			// type=2, 用户点击前进后退按钮
		    window.history.replaceState({ path, custom: 'world' }, '', path);
		   // ...
		}
		this._refresh(path, isOnLoad);
	}
	```
	
## 三. 服务端和浏览器的同构
* 要保证服务器返回的html, 对这个html解析生成的dom结构和根据浏览器js模版生成的dom是一致的。
原理：
1. 服务端和浏览器端两端data的初始数据设置成一致。
2. 服务端和浏览器端都是对同一份模板解析生成ast，再由ast生成渲染函数体的字符串形式，再把渲染函数体的字符串变为渲染函数，服务端调用这个渲染函数，生成html。
3. 在服务器返回的html文件中要引入已经打包生成的浏览器js, 这个浏览器js要能解析服务端返回的dom, 做好数据监听, 生成虚拟dom等工作。

server.js


```
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(
        `<html>
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>My app</title>
            ${css}
        </head>
            <body>
                <div id="app">${render()}</div>
                <!--导入 Webpack 输出的用于浏览器端渲染的 JS 文件-->
                ${scripts}
            </body>
         </html>`,
    );
});
```
* 因为服务端和浏览器的dom结构保持了一致，因此加载js完毕后，用户行为触发的一些js代码所带来的最终dom的改变， 作用到真实dom上的时候，页面的渲染是平稳的。
* 如果应用了flux类型的架构， 如redux等(当前代码中未实现)。

server.js返回的html中加入

```
 <!--返回初始状态值，在浏览器js的store中会调用，保证双方初始状态一致->
<script>
	window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
</script>
```

browser.js中

```
// __INITIAL_STATE__ 来自服务器端
const initialState = window.__INITIAL_STATE__;
const store = configureStore(initialState);
```

	
##  四. 自定义webpack插件FileListPlugin
 * 为什么需要FileListPlugin？
 
 为了实现同构，要在服务端注入浏览器的非异步js, 就要区分哪些文件是异步的，哪些文件是同步载入的。
 要把css文件放在一起，js文件放在一起。
 
 * FileListPlugin做了什么？

 a. 在emit事件触发后拿到当前的compilation编译对象，调用compilation.getStats()拿到当次的编译结果（一个对象, 可以通过npm run analyze到生成的stats.json中查看），对象属性是重要的构建信息比如
	 
	assetsByChunkName（Object, chunk名和它对应的asset文件），
	
	assets（Array, 最后准备输出的一系列文件），
	
	entrypoints（Object, 入口文件和该入口文件要包含的assets），
	
	chunks（Array, 编译过程中生成的所有chunks, chunks中的每个chunk对应还包含了该chunk所载入的modules信息）。
	
	b. 通过过滤 stats.assets中有而stats.entrypoints中没有的文件，得到非异步js的文件名。
	通过判断后缀，对css和js归类。
	
	c. 构造json字符串，生成一个clientFileList.json文件，输出到output path中。server.js读取该文件内容，进行处理。
	
	FileListPlugin.js
	
	```
	// ... 处理compilation.getStats()
	const clientFileList = JSON.stringify({
        entryJs,
        entryCss,
        asyncFiles,
        publicPath: stats.publicPath,
    });
    // 把它作为一个新的文件资源输出到output path中：
    compilation.assets['clientFileList.json'] = {
        source() {
            return clientFileList;
        },
        size() {
            return clientFileList.length;
        },
    };
	```
	
	server.js
	
	```
	const clientFileList = require('./dist/clientFileList.json');
	let css = '';
	clientFileList.entryCss.forEach(element => {
	    css += ` <link rel="stylesheet" href="${clientFileList.publicPath}${element}">`;
	}, this);
	let scripts = '';
	clientFileList.entryJs.forEach(element => {
	    scripts += `<script src="${clientFileList.publicPath}${element}"></script>`;
	}, this);
		
	```
	

 # myapp存在的问题
因为时间和能力有限，当前代码中存在的问题如下：

1. 当前代码中的router和mvvm不是浏览器端和服务器端可以共用的实例， 它依赖于浏览器端, 用到了window.addEventListener等, 没办法像vue的同构一样可以在server.js中直接引入const Vue = require('vue')和Vue.use(Router)。而所谓的服务端html也只是粗糙地返回了字符串而已（参见entry_server.js）。

	解决: 后续进一步抽离出router和mvvm的代码, 让他们成为浏览器端和服务器端可以共用的实例。

2. 当前代码只是实现简单的指令解析和数据绑定，没有实现虚拟dom。

3. 对于前端切换路由时， 已经载入的component如何处理？ 当前代码中粗暴地用了display: none，待改进。

 

