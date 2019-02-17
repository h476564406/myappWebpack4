import { CompileUtil } from './CompileUtil';

/*
    对每个元素节点的指令进行解析，根据指令模板替换数据完成第一次渲染，
    准备好readyWatcher，传入更新时的回调函数。
*/
function Compile(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);
    this.compileUtil = CompileUtil(this.$vm);

    // 从document中尝试获取该组件id的元素，来判断是否是服务器渲染
    this.$component = document.getElementById(this.$vm.$options.id);

    if (this.$el !== null) {
        const templateDiv = document.createElement('div');

        templateDiv.innerHTML = vm.$options.template;

        this.$fragment = this.generateFragment(templateDiv);

        this.compileNode(this.$fragment);

        // 如果这个组件标明启用了服务器渲染，因为服务端返回的html中已经存在该节点，采用replaceChild的方式。
        if (this.$component && this.$component.dataset.serverRendered) {
            this.$el.replaceChild(this.$fragment, this.$component);
        } else {
            this.$el.appendChild(this.$fragment);
        }
    }
}

Compile.prototype = {
    generateFragment(templateDiv) {
        const fragment = document.createDocumentFragment();

        let child = templateDiv.firstChild;

        while (child) {
            fragment.appendChild(child);
            child = templateDiv.firstChild;
        }

        return fragment;
    },

    compileNode(templateFragment) {
        const { childNodes } = templateFragment;

        [].slice.call(childNodes).forEach(node => {
            const { nodeType } = node;

            switch (nodeType) {
                // 元素节点
                case 1:
                    this.compileElement(node, node.childNodes);
                    break;

                // 文本节点
                case 3:
                    const matches = node.nodeValue.match(/\{\{(.*)\}\}/);

                    if (matches !== null) {
                        this.compileText(node, matches[1].replace(/\s*/g, ''));
                    }

                    break;
                default:
                    break;
            }

            if (node.childNodes && node.childNodes.length) {
                this.compileNode(node);
            }
        }, this);
    },

    compileElement(node) {
        const nodeAttributes = node.attributes;

        [].slice.call(nodeAttributes).forEach(attribute => {
            const attributeName = attribute.name;

            if (this.isDirective(attributeName)) {
                const property = attribute.value;
                // v-on:click=>on:click
                const directive = attributeName.substring(2);

                if (this.isEventDirective(directive)) {
                    // 为这个node节点添加事件监听器
                    this.compileUtil.addEventHandler(node, property, directive);
                } else if (this.isForDirective(directive)) {
                    this.compileUtil[directive](node, property);
                } else {
                    // 普通指令
                    this.compileUtil[directive] &&
                        this.compileUtil[directive](node, property);
                }

                // 移除编译过的属性
                node.removeAttribute(attributeName);
            }
        }, this);
    },

    compileText(node, property) {
        this.compileUtil.text(node, property);
    },

    isDirective(attributeName) {
        return attributeName.indexOf('v-') === 0;
    },

    isEventDirective(directive) {
        return directive.indexOf('on') === 0;
    },

    isForDirective(directive) {
        return directive.indexOf('for') === 0;
    },
};

export default Compile;
