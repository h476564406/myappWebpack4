import { CompileUtil } from './CompileUtil';

/*
    对每个元素节点的指令进行解析，根据指令模板替换数据完成第一次渲染，
    准备好readyWatcher，传入更新时的回调函数。
    @param string el the root div
    @param object vm the instance of MVVM
*/
function Compile(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);
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
        // 如果fragment.appendChild的参数是已有的元素，会从tempDiv里移除
        // 把templateDiv里面的第一层节点全部移到fragment中
        while (child) {
            fragment.appendChild(child);
            child = templateDiv.firstChild;
        }
        return fragment;
    },
    // 分析templateFragment中的节点， 按不同的类型分调函数处理。
    compileNode(templateFragment) {
        const { childNodes } = templateFragment;
        const self = this;
        [].slice.call(childNodes).forEach(node => {
            const { nodeType } = node;
            switch (nodeType) {
                // 元素节点
                case 1:
                    self.compileElement(node, node.childNodes);
                    break;
                // 文本节点
                case 3:
                    const matches = node.nodeValue.match(/\{\{(.*)\}\}/);
                    if (matches !== null) {
                        [CompileUtil.withBrace] = matches;
                        self.compileText(node, matches[1].replace(/\s*/g, ''));
                    }
                    break;
                default:
                    break;
            }
            if (node.childNodes && node.childNodes.length) {
                self.compileNode(node);
            }
        });
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
                    CompileUtil.addEventHandler(
                        node,
                        this.$vm,
                        property,
                        directive,
                    );
                } else if (this.isForDirective(directive)) {
                    CompileUtil[directive](
                        node,
                        this.$vm,
                        property,
                        node.innerHTML,
                    );
                } else {
                    // 普通指令
                    CompileUtil[directive] &&
                        CompileUtil[directive](node, this.$vm, property);
                }
                // 移除编译过的属性
                node.removeAttribute(attributeName);
            }
        }, this);
    },
    compileText(node, property) {
        CompileUtil.text(node, this.$vm, property);
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
