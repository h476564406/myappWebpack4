import Watcher from './Watcher';

export const CompileUtil = {
    text(node, vm, property) {
        this.bindWatcherAndCallback(node, vm, property, 'text');
    },
    html(node, vm, property) {
        this.bindWatcherAndCallback(node, vm, property, 'html');
    },
    class(node, vm, property) {
        this.bindWatcherAndCallback(node, vm, property, 'class');
    },
    // 可输入元素的value
    model(node, vm, property) {
        this.bindWatcherAndCallback(node, vm, property, 'model');
        const value = this._getVMVal(vm, property);
        // 添加事件监听器，当 <input> 或 <textarea> 元素的值更改时，对比新旧值，决定是否set.
        node.addEventListener('input', e => {
            const newValue = e.target.value;
            if (value === newValue) {
                return;
            }
            this._setVMVal(vm, property, newValue);
        });
    },
    for(node, vm, property, nodeHtml) {
        this.bindWatcherAndCallback(
            node,
            vm,
            property.split(/\sin\s/)[1],
            'for',
            nodeHtml,
        );
    },
    // 根据初始化的data渲染视图，绑定watcher和更新函数。
    bindWatcherAndCallback(node, vm, property, directive, nodeHtml = null) {
        const updater = {
            // 无论是文本节点还是只包含v-text指令的元素节点, 将当前这个节点的内容替换成属性值。
            textUpdater(value) {
                // 不可以这么做，nodevalue只能对文本节点设值，但是模版里可能会直接在元素节点挂载v-text指令
                // node.nodeValue = value;
                // 不可以这么做，文本节点没有innerText, node.innerText will be undefined
                // node.innerText = value;
                const text = node.textContent;
                if (CompileUtil.withBrace) {
                    node.textContent = text.replace(
                        CompileUtil.withBrace,
                        value,
                    );
                } else {
                    node.textContent = value;
                }
                CompileUtil.withBrace = '';
            },
            // 将当前元素节点的innerHTML替换成属性值。
            htmlUpdater(value) {
                node.innerHTML = value || '';
            },
            // 将当前元素节点的className替换成属性值。
            classUpdater(newClass) {
                const { className } = node;
                const value = String(newClass) ? newClass : '';
                node.className = className ? ' ' : `${value}`;
            },
            // 针对表单中的可输入控件。将input, textarea的value替换为属性值
            modelUpdater(value) {
                node.value = value || '';
            },
            // 针对for循环，进行正则表达式的处理。
            forUpdater(value) {
                // 由于for循环的innerHTML可能出现多个被花括号包含的属性
                // 因此采用非贪婪匹配，以识别出所有的属性。
                const regexp = /(\{\{(.*?)\}\})/gi;
                let str = '';
                // 可能不是性能最好的方法，需改进
                for (let index = 0; index < value.length; index += 1) {
                    str += nodeHtml.replace(regexp, (...rest) => {
                        // rest[2] 为捕获到的子组
                        const childProperty = rest[2]
                            .replace(/\s+/g, '')
                            .split('.')[1];
                        return value[index][childProperty];
                    });
                }
                node.innerHTML = str;
                // while (regexp.exec(children)) {
                //     const p = RegExp.$2.replace(/\s+/g, '');
                // }
            },
        };
        const updaterFn = updater[`${directive}Updater`];
        // 第一次渲染 view, 此时Dep.readyWatcher还不存在, 被触发的getter函数只是得到值，并没有绑定watcher
        updaterFn && updaterFn(this._getVMVal(vm, property));
        // 创建readyWatcher, 在初始化Wather的过程中连接watcher和deps。传入回调函数， 更新时调用。
        new Watcher(vm, property, value => {
            updaterFn && updaterFn(value);
        });
    },
    // on:click
    addEventHandler(node, vm, property, directive) {
        const eventType = directive.split(':')[1];
        // 如果第一个值是对象, 则返回第二个操作数
        const fn = vm.$options.methods && vm.$options.methods[property];
        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    },
    _getVMVal(vm, property) {
        let value = vm;
        property.split('.').forEach(element => {
            value = value[element];
        });
        return value;
    },
    _setVMVal(vm, property, value) {
        let val = vm;
        const properties = property.split('.');
        properties.forEach((k, i) => {
            if (i < properties.length - 1) {
                val = val[k];
            } else {
                val[k] = value;
            }
        });
    },
};
