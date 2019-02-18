import Watcher from './Watcher';
import { getValue, setValue } from './Util';

function updater(node, nodeHtml) {
    return {
        // 无论是文本节点还是只包含v-text指令的元素节点, 将当前这个节点的内容替换成属性值。
        textUpdater(value) {
            // 不可以这么做，只对文本节点生效，但是模版里可能会在元素节点上挂载v-text指令
            // node.nodeValue = value;
            // 不可以这么做，只对元素节点生效。文本节点没有innerText, node.innerText will be undefined
            // node.innerText = value;
            // 文本节点生效和元素节点都生效。
            node.textContent = value;
        },

        // 将当前元素节点的innerHTML替换成属性值。
        htmlUpdater(value) {
            node.innerHTML = value || '';
        },

        // 将当前元素节点的className替换成属性值。
        classUpdater(newValue) {
            const { className } = node;

            const value = newValue || '';

            node.className = className ? ` ${value}` : value;
        },

        // 针对表单中的可输入控件。将input, textarea的value替换为属性值。model => value
        modelUpdater(value) {
            node.value = value || '';
        },

        // 针对for循环，进行正则表达式的处理。
        forUpdater(value) {
            // 由于for循环的innerHTML可能出现多个被花括号包含的属性。 <li>{{ item.name }} {{ item.message }}</li>
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
        },
    };
}

export function CompileUtil(vm) {
    return {
        text(node, property) {
            this.bindWatcherAndUpdater(node, property, 'text');
        },

        html(node, property) {
            this.bindWatcherAndUpdater(node, property, 'html');
        },

        class(node, property) {
            this.bindWatcherAndUpdater(node, property, 'class');
        },

        // 可输入元素的value
        model(node, property) {
            this.bindWatcherAndUpdater(node, property, 'model');

            const value = getValue(vm, property);

            // 添加事件监听器，当 <input> 或 <textarea> 元素的值更改时，对比新旧值，决定是否set. value=>data
            node.addEventListener('input', e => {
                const newValue = e.target.value;

                if (value === newValue) {
                    return;
                }

                setValue(vm, property, newValue);
            });
        },

        for(node, property, nodeHtml) {
            this.bindWatcherAndUpdater(
                node,
                property.split(/\sin\s/)[1],
                'for',
                nodeHtml,
            );
        },

        // 根据初始化的data渲染视图，绑定watcher和更新函数。
        bindWatcherAndUpdater(node, property, directive) {
            const updaterFn = updater(node, node.innerHTML)[
                `${directive}Updater`
            ];

            // 第一次渲染 view, 此时Dep.target还不存在, 被触发的getter函数只是得到值，并没有绑定watcher
            updaterFn && updaterFn(getValue(vm, property));

            // 创建target, 在初始化Wather的过程中连接watcher和deps。传入回调函数， 更新时调用。
            new Watcher(vm, property, newValue => {
                updaterFn && updaterFn(newValue);
            });
        },

        // on:click
        addEventHandler(node, property, directive) {
            const eventType = directive.split(':')[1];
            // 如果第一个值是对象, 则返回第二个操作数
            const fn = vm.$options.methods && vm.$options.methods[property];

            if (eventType && fn) {
                node.addEventListener(eventType, fn.bind(vm), false);
            }
        },
    };
}
